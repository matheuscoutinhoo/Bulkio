import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { config } from '../config';
import { exerciseRepository } from '../repositories/exerciseRepository';
import { userRepository } from '../repositories/userRepository';
import { workoutPlanService } from './workoutPlanService';
import { buildPrompt } from '../utils/promptBuilder';
import { ValidationError } from '../utils/errors';
import { logger } from '../config/logger';

const aiExerciseSchema = z.object({
   exerciseId: z.string(),
   sets: z.number().int().min(1).max(10),
   reps: z.string().min(1).max(20),
   restSeconds: z.number().int().min(30).max(300),
});

const aiResponseSchema = z.object({
   name: z.string().min(1).max(100),
   exercises: z.array(aiExerciseSchema).min(1),
});

// Map common Portuguese focus terms to DB muscle group enums
const FOCUS_TO_GROUPS: Record<string, string[]> = {
   peito: ['CHEST'],
   peitoral: ['CHEST'],
   costas: ['BACK'],
   dorsal: ['BACK'],
   perna: ['LEGS', 'GLUTES', 'CALVES'],
   pernas: ['LEGS', 'GLUTES', 'CALVES'],
   inferior: ['LEGS', 'GLUTES', 'CALVES'],
   ombro: ['SHOULDERS'],
   ombros: ['SHOULDERS'],
   biceps: ['BICEPS'],
   'bíceps': ['BICEPS'],
   triceps: ['TRICEPS'],
   'tríceps': ['TRICEPS'],
   braço: ['BICEPS', 'TRICEPS', 'FOREARMS'],
   'braços': ['BICEPS', 'TRICEPS', 'FOREARMS'],
   abdomen: ['ABS'],
   'abdômen': ['ABS'],
   abs: ['ABS'],
   'glúteos': ['GLUTES'],
   gluteos: ['GLUTES'],
   panturrilha: ['CALVES'],
   'antebraço': ['FOREARMS'],
   'trapézio': ['TRAPS'],
   superior: ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'],
   push: ['CHEST', 'SHOULDERS', 'TRICEPS'],
   pull: ['BACK', 'BICEPS', 'FOREARMS'],
   full: ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS'],
   'full body': ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS'],
};

function resolveGroups(focus: string): string[] {
   const normalized = focus.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
   const groups = new Set<string>();

   for (const [keyword, muscleGroups] of Object.entries(FOCUS_TO_GROUPS)) {
      const normalizedKey = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes(normalizedKey)) {
         muscleGroups.forEach((g) => groups.add(g));
      }
   }

   return groups.size > 0 ? [...groups] : [];
}

interface GenerateInput {
   level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
   focus: string;
   description?: string;
}

export const aiWorkoutService = {
   async generate(userId: string, input: GenerateInput) {
      if (!config.geminiApiKey) {
         throw new ValidationError('Gemini API key not configured');
      }

      // Resolve focus to muscle groups and fetch only relevant exercises
      const muscleGroups = resolveGroups(input.focus);
      const [user, [exercises]] = await Promise.all([
         userRepository.findById(userId),
         exerciseRepository.findAll({
            page: 1,
            limit: 300,
            ...(muscleGroups.length > 0 && { muscleGroups }),
         }),
      ]);

      const prompt = buildPrompt(exercises, {
         goal: user?.goal ?? null,
         initialWeight: user?.initialWeight ?? null,
         targetWeight: user?.targetWeight ?? null,
         height: user?.height ?? null,
      }, input);

      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({
         model: 'gemini-2.5-flash',
         generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
            maxOutputTokens: 4096,
         },
      });

      let parsed: z.infer<typeof aiResponseSchema>;

      // Try up to 2 times
      for (let attempt = 1; attempt <= 2; attempt++) {
         let result;
         try {
            result = await model.generateContent(prompt);
         } catch (err: any) {
            if (err?.status === 429) {
               throw new ValidationError('Limite de requisições da IA atingido. Tente novamente em alguns minutos.');
            }
            logger.error({ err }, 'Gemini API call failed');
            throw new ValidationError('Erro ao se comunicar com a IA. Tente novamente.');
         }
         const text = result.response.text();
         logger.info({ attempt, textLength: text.length }, 'AI response received');

         try {
            const json = JSON.parse(text);
            parsed = aiResponseSchema.parse(json);
         } catch (err) {
            logger.warn({ attempt, err }, 'AI response validation failed');
            if (attempt === 2) {
               throw new ValidationError('Failed to generate valid workout plan from AI');
            }
            continue;
         }

         // Validate all exerciseIds exist in our catalog
         const exerciseIds = new Set(exercises.map((e) => e.id));
         parsed!.exercises = parsed!.exercises.filter((e) => exerciseIds.has(e.exerciseId));
         if (parsed!.exercises.length === 0) {
            throw new ValidationError('AI generated exercises not found in catalog');
         }
         // Re-index order
         parsed!.exercises.forEach((e, i) => { e.order = i; });

         // Create the plan
         const created = await workoutPlanService.create(userId, {
            name: parsed!.name,
            exercises: parsed!.exercises,
         });

         return created;
      }

      throw new ValidationError('Failed to generate workout plan');
   },
};
