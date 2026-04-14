import { z } from 'zod';
import { config } from '../config';
import { exerciseRepository } from '../repositories/exerciseRepository';
import { userRepository } from '../repositories/userRepository';
import { dashboardRepository } from '../repositories/dashboardRepository';
import { personalRecordRepository } from '../repositories/personalRecordRepository';
import { workoutPlanService } from './workoutPlanService';
import { buildPrompt } from '../utils/promptBuilder';
import { ValidationError } from '../utils/errors';
import { logger } from '../config/logger';

// Compact AI response schema: i=index, s=sets, r=reps, d=rest(descanso), w=weight(kg)
const aiExerciseSchema = z.object({
   i: z.number().int().min(0),
   s: z.number().int().min(1).max(10),
   r: z.string().min(1).max(20),
   d: z.number().int().min(30).max(300),
   w: z.number().min(0).optional(),
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

function getWeekStart(): Date {
   const now = new Date();
   const day = now.getDay();
   const start = new Date(now);
   start.setDate(now.getDate() - day);
   start.setHours(0, 0, 0, 0);
   return start;
}

interface GenerateInput {
   level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
   focus: string;
   description?: string;
}

// Normalize AI response: extract compact {e:[...]} from alternative structures
function normalizeAiResponse(json: unknown): unknown {
   if (typeof json !== 'object' || json === null) return json;
   const obj = json as Record<string, unknown>;

   // Already in expected format
   if (Array.isArray(obj.e)) return obj;

   // Look for nested exercise arrays in common AI response patterns
   const exerciseArray = findExerciseArray(obj);
   if (exerciseArray) {
      return { e: exerciseArray.map(normalizeExercise) };
   }

   return json;
}

function findExerciseArray(obj: Record<string, unknown>): unknown[] | null {
   // Check known nested keys: treino.exercicios, exercises, workout.exercises, etc.
   for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') return val;
      if (typeof val === 'object' && val !== null) {
         const nested = val as Record<string, unknown>;
         for (const nk of Object.keys(nested)) {
            if (Array.isArray(nested[nk]) && (nested[nk] as unknown[]).length > 0) return nested[nk] as unknown[];
         }
      }
   }
   return null;
}

function normalizeExercise(ex: unknown): unknown {
   if (typeof ex !== 'object' || ex === null) return ex;
   const e = ex as Record<string, unknown>;
   const rawW = e.w !== undefined ? e.w : e.weight ?? e.carga;
   const w = typeof rawW === 'number' ? rawW : undefined;
   const rawR = e.r ?? e.reps ?? e.repeticoes ?? e.repetitions;
   // Map verbose keys to compact keys
   return {
      i: e.i ?? e.id ?? e.index,
      s: e.s ?? e.series ?? e.sets,
      r: typeof rawR === 'number' ? String(rawR) : String(rawR ?? ''),
      d: e.d ?? e.descanso ?? e.rest ?? e.restSeconds,
      ...(w !== undefined && { w }),
   };
}

export const aiWorkoutService = {
   async generate(userId: string, input: GenerateInput) {
      if (!config.llmApiKey) {
         throw new ValidationError('LLM API key not configured');
      }

      // Resolve focus to muscle groups and fetch only relevant exercises
      const muscleGroups = resolveGroups(input.focus);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const weekStart = getWeekStart();

      const [user, [exercises], muscleGroupData, weeklyWorkouts, allPRs, bodyWeightHistory] = await Promise.all([
         userRepository.findById(userId),
         exerciseRepository.findAll({
            page: 1,
            limit: 80,
            ...(muscleGroups.length > 0 && { muscleGroups }),
         }),
         dashboardRepository.getMuscleGroupVolume(userId, thirtyDaysAgo, new Date()),
         dashboardRepository.getWeeklyWorkouts(userId, weekStart, new Date()),
         personalRecordRepository.findAllByUser(userId),
         dashboardRepository.getBodyWeightHistory(userId, 1),
      ]);

      // Aggregate muscle distribution (sets per group, last 30d)
      const muscleDistribution: Record<string, number> = {};
      for (const entry of muscleGroupData) {
         const group = entry.exercise.muscleGroup;
         muscleDistribution[group] = (muscleDistribution[group] || 0) + entry.sets.length;
      }

      // Filter PRs relevant to focus muscles, limit 5
      const focusGroupSet = new Set(muscleGroups);
      let relevantPRs = allPRs
         .filter((pr) => focusGroupSet.size === 0 || focusGroupSet.has(pr.exercise.muscleGroup))
         .slice(0, 5)
         .map((pr) => ({ name: pr.exercise.name, weight: pr.weight, reps: pr.reps }));

      if (relevantPRs.length === 0 && allPRs.length > 0) {
         relevantPRs = allPRs
            .slice(0, 5)
            .map((pr) => ({ name: pr.exercise.name, weight: pr.weight, reps: pr.reps }));
      }

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
         currentWeight: bodyWeightHistory[0]?.weight ?? null,
         weeklyFrequency: weeklyWorkouts,
         muscleDistribution,
         relevantPRs,
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
            const normalized = normalizeAiResponse(json);
            parsed = aiResponseSchema.parse(normalized);
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
               weight: ex.w ?? null,
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
