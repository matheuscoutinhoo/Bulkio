import { z } from 'zod';
import { config } from '../config';
import { exerciseRepository } from '../repositories/exerciseRepository';
import { userRepository } from '../repositories/userRepository';
import { workoutPlanService } from './workoutPlanService';
import { buildPrompt } from '../utils/promptBuilder';
import { ValidationError } from '../utils/errors';
import { logger } from '../config/logger';

// Compact AI response schema: i=index, s=sets, r=reps, d=rest(descanso)
const aiExerciseSchema = z.object({
   i: z.number().int().min(0),
   s: z.number().int().min(1).max(10),
   r: z.string().min(1).max(20),
   d: z.number().int().min(30).max(300),
});

const aiResponseSchema = z.object({
   e: z.array(aiExerciseSchema).min(1),
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
      if (!config.llmApiKey) {
         throw new ValidationError('LLM API key not configured');
      }

      // Resolve focus to muscle groups and fetch only relevant exercises
      const muscleGroups = resolveGroups(input.focus);
      const [user, [exercises]] = await Promise.all([
         userRepository.findById(userId),
         exerciseRepository.findAll({
            page: 1,
            limit: 80,
            ...(muscleGroups.length > 0 && { muscleGroups }),
         }),
      ]);

      // Build index→ID map for compact prompt
      const indexMap = exercises.map((e) => e.id);
      const indexedExercises = exercises.map((e, i) => ({
         index: i,
         name: e.name,
         muscleGroup: e.muscleGroup,
         type: e.type,
         equipment: e.equipment,
      }));

      const prompt = buildPrompt(indexedExercises, {
         goal: user?.goal ?? null,
         initialWeight: user?.initialWeight ?? null,
         targetWeight: user?.targetWeight ?? null,
         height: user?.height ?? null,
      }, input);

      let parsed: z.infer<typeof aiResponseSchema>;

      // Try up to 2 times
      for (let attempt = 1; attempt <= 2; attempt++) {
         let response;
         try {
            response = await fetch(`${config.llmBaseUrl}/chat/completions`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${config.llmApiKey}`,
               },
               body: JSON.stringify({
                  model: config.llmModel,
                  messages: [{ role: 'user', content: prompt }],
                  temperature: 0.3,
                  max_tokens: 1024,
                  response_format: { type: 'json_object' },
               }),
            });
         } catch (err) {
            logger.error({ err }, 'LLM API call failed');
            throw new ValidationError('Erro ao se comunicar com a IA. Tente novamente.');
         }

         if (response.status === 429) {
            throw new ValidationError('Limite de requisições da IA atingido. Tente novamente em alguns minutos.');
         }

         if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            logger.error({ status: response.status, errorBody }, 'LLM API error');
            throw new ValidationError('Erro ao se comunicar com a IA. Tente novamente.');
         }

         const data = await response.json();
         const text = data.choices?.[0]?.message?.content ?? '';
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

         // Map indices back to real exerciseIds, filter invalid indices
         const mappedExercises = parsed!.e
            .filter((ex) => ex.i >= 0 && ex.i < indexMap.length)
            .map((ex, order) => ({
               exerciseId: indexMap[ex.i],
               sets: ex.s,
               reps: ex.r,
               restSeconds: ex.d,
               order,
            }));

         if (mappedExercises.length === 0) {
            throw new ValidationError('AI generated exercises not found in catalog');
         }

         // Generate name server-side to save output tokens
         const planName = `Treino de ${input.focus}`;

         const created = await workoutPlanService.create(userId, {
            name: planName,
            exercises: mappedExercises,
         });

         return created;
      }

      throw new ValidationError('Failed to generate workout plan');
   },
};
