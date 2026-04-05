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
});

// ========== EXERCISE ==========
export const muscleGroups = [
   'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS',
   'ABS', 'CARDIO', 'GLUTES', 'FOREARMS', 'TRAPS', 'CALVES', 'FULL_BODY',
] as const;

export const exerciseTypes = ['COMPOUND', 'ISOLATED', 'CARDIO'] as const;

export const equipmentTypes = [
   'BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'BAND', 'OTHER',
] as const;

export const createExerciseSchema = z.object({
   name: z.string().min(1, 'Name is required').max(100),
   muscleGroup: z.enum(muscleGroups),
   type: z.enum(exerciseTypes),
   equipment: z.enum(equipmentTypes),
   description: z.string().max(500).optional(),
   videoUrl: z.string().url().max(500).optional().nullable(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

// ========== WORKOUT PLAN ==========
export const workoutPlanExerciseSchema = z.object({
   exerciseId: z.string().uuid(),
   sets: z.number().int().min(1).max(20),
   reps: z.string().min(1).max(20),
   restSeconds: z.number().int().min(0).max(600).default(60),
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
   isArchived: z.boolean().optional(),
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
   exercises: z.array(workoutLogExerciseSchema),
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
});

// ========== BODY WEIGHT ==========
export const createBodyWeightSchema = z.object({
   weight: z.number().positive('Weight must be positive'),
   date: z.string().datetime().optional(),
});

// ========== PAGINATION ==========
export const paginationSchema = z.object({
   page: z.coerce.number().int().min(1).default(1),
   limit: z.coerce.number().int().min(1).max(100).default(20),
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

export const workoutPlanQuerySchema = paginationSchema.extend({
   includeArchived: z.string().optional(),
});

// ========== TYPES ==========
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>;
export type CreateWorkoutLogInput = z.infer<typeof createWorkoutLogSchema>;
export type UpdateWorkoutLogInput = z.infer<typeof updateWorkoutLogSchema>;
export type CreateBodyWeightInput = z.infer<typeof createBodyWeightSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
