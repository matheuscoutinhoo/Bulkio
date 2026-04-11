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
   order: z.number().int().min(0),
});

const aiResponseSchema = z.object({
   plans: z.array(z.object({
      name: z.string().min(1).max(100),
      exercises: z.array(aiExerciseSchema).min(1),
   })).min(1),
});

interface GenerateInput {
   daysPerWeek: number;
   level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
   focus?: string;
}

export const aiWorkoutService = {
   async generate(userId: string, input: GenerateInput) {
      if (!config.geminiApiKey) {
         throw new ValidationError('Gemini API key not configured');
      }

      // Fetch user profile + full exercise catalog in parallel
      const [user, [exercises]] = await Promise.all([
         userRepository.findById(userId),
         exerciseRepository.findAll({ page: 1, limit: 300 }),
      ]);

      const prompt = buildPrompt(exercises, {
         goal: user?.goal ?? null,
         initialWeight: user?.initialWeight ?? null,
         targetWeight: user?.targetWeight ?? null,
         height: user?.height ?? null,
      }, input);

      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({
         model: 'gemini-2.0-flash',
         generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
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
         for (const plan of parsed!.plans) {
            plan.exercises = plan.exercises.filter((e) => exerciseIds.has(e.exerciseId));
            if (plan.exercises.length === 0) {
               throw new ValidationError('AI generated exercises not found in catalog');
            }
            // Re-index order
            plan.exercises.forEach((e, i) => { e.order = i; });
         }

         // Create all plans
         const createdPlans = [];
         for (const plan of parsed!.plans) {
            const created = await workoutPlanService.create(userId, {
               name: plan.name,
               exercises: plan.exercises,
            });
            createdPlans.push(created);
         }

         return createdPlans;
      }

      throw new ValidationError('Failed to generate workout plans');
   },
};
