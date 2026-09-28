import { z } from 'zod';

// ========== AUTH ==========
export const registerSchema = z.object({
   email: z.string().email('Invalid email address'),
   username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
   password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
});

export const loginSchema = z.object({
   email: z.string().email('Invalid email address'),
   password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
   username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/)
      .optional(),
   goal: z.enum(['BULK', 'CUT', 'MAINTAIN']).optional().nullable(),
   initialWeight: z.number().positive().optional().nullable(),
   targetWeight: z.number().positive().optional().nullable(),
   height: z.number().positive().max(300).optional().nullable(),
});

// ========== WORKOUT PLAN ==========
export const workoutPlanExerciseSchema = z.object({
   exerciseId: z.string().uuid(),
   sets: z.number().int().min(1).max(20),
   reps: z.string().min(1).max(20),
   restSeconds: z.number().int().min(0).max(600).default(60),
   weight: z.number().min(0).optional().nullable(),
   order: z.number().int().min(0),
   notes: z.string().max(500).optional(),
});

export const createWorkoutPlanSchema = z.object({
   name: z.string().min(1, 'Name is required').max(100),
   description: z.string().max(500).optional(),
   exercises: z.array(workoutPlanExerciseSchema).optional(),
});

export const updateWorkoutPlanSchema = z.object({
   name: z.string().min(1).max(100).optional(),
   description: z.string().max(500).optional().nullable(),
   exercises: z.array(workoutPlanExerciseSchema).optional(),
});

// ========== WORKOUT LOG ==========
export const workoutLogSetSchema = z.object({
   setNumber: z.number().int().min(1),
   reps: z.number().int().min(0),
   weight: z.number().min(0),
   notes: z.string().max(500).optional(),
});

export const workoutLogExerciseSchema = z.object({
   exerciseId: z.string().uuid(),
   order: z.number().int().min(0),
   notes: z.string().max(500).optional(),
   sets: z.array(workoutLogSetSchema),
});

export const createWorkoutLogSchema = z.object({
   workoutPlanId: z.string().uuid().optional().nullable(),
   date: z.string().datetime().optional(),
   startTime: z.string().datetime().optional().nullable(),
   endTime: z.string().datetime().optional().nullable(),
   isComplete: z.boolean().default(false),
   notes: z.string().max(1000).optional(),
   exercises: z.array(workoutLogExerciseSchema).default([]),
}).refine(
   (data) => {
      if (data.startTime && data.endTime) {
         return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
   },
   { message: 'endTime must be after startTime', path: ['endTime'] },
);

export const updateWorkoutLogSchema = z.object({
   isComplete: z.boolean().optional(),
   notes: z.string().max(1000).optional().nullable(),
   endTime: z.string().datetime().optional().nullable(),
   startTime: z.string().datetime().optional().nullable(),
   date: z.string().datetime().optional(),
   workoutPlanId: z.string().uuid().optional().nullable(),
   exercises: z.array(z.object({
      exerciseId: z.string().uuid(),
      order: z.number().int().min(0),
      notes: z.string().max(500).optional(),
      sets: z.array(z.object({
         setNumber: z.number().int().min(1),
         reps: z.number().int().min(0),
         weight: z.number().min(0),
         notes: z.string().max(500).optional(),
      })).min(1),
   })).optional(),
});

// ========== BODY WEIGHT ==========
export const createBodyWeightSchema = z.object({
   weight: z.number().positive('Weight must be positive'),
   date: z.string().datetime().optional(),
});

// ========== PAGINATION ==========
export const paginationSchema = z.object({
   page: z.coerce.number().int().min(1).default(1),
   limit: z.coerce.number().int().min(1).max(300).default(20),
});

// ========== QUERY SCHEMAS (extend pagination with route-specific filters) ==========
export const exerciseQuerySchema = paginationSchema.extend({
   muscleGroup: z.string().optional(),
   type: z.string().optional(),
   equipment: z.string().optional(),
   search: z.string().optional(),
});

export const workoutLogQuerySchema = paginationSchema.extend({
   startDate: z.string().optional(),
   endDate: z.string().optional(),
   exerciseId: z.string().optional(),
   muscleGroup: z.string().optional(),
   workoutPlanId: z.string().optional(),
});

export const workoutPlanQuerySchema = paginationSchema.extend({});

// ========== TYPES ==========
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>;
export type CreateWorkoutLogInput = z.infer<typeof createWorkoutLogSchema>;
export type UpdateWorkoutLogInput = z.infer<typeof updateWorkoutLogSchema>;
export type CreateBodyWeightInput = z.infer<typeof createBodyWeightSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
