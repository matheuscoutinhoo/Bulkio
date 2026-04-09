import { describe, it, expect } from 'vitest';
import {
   registerSchema,
   loginSchema,
   updateProfileSchema,
   workoutPlanExerciseSchema,
   createWorkoutPlanSchema,
   updateWorkoutPlanSchema,
   createWorkoutLogSchema,
   updateWorkoutLogSchema,
   workoutLogExerciseSchema,
   workoutLogSetSchema,
   createBodyWeightSchema,
   paginationSchema,
   exerciseQuerySchema,
   workoutLogQuerySchema,
   workoutPlanQuerySchema,
} from '../../models/schemas';

describe('registerSchema', () => {
   it('should accept valid input', () => {
      const result = registerSchema.safeParse({
         email: 'test@example.com',
         username: 'user123',
         password: 'password123',
      });
      expect(result.success).toBe(true);
   });

   it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
         email: 'not-an-email',
         username: 'user123',
         password: 'password123',
      });
      expect(result.success).toBe(false);
   });

   it('should reject short username (< 3)', () => {
      const result = registerSchema.safeParse({
         email: 'a@b.com',
         username: 'ab',
         password: 'password123',
      });
      expect(result.success).toBe(false);
   });

   it('should reject long username (> 30)', () => {
      const result = registerSchema.safeParse({
         email: 'a@b.com',
         username: 'a'.repeat(31),
         password: 'password123',
      });
      expect(result.success).toBe(false);
   });

   it('should reject username with special characters', () => {
      const result = registerSchema.safeParse({
         email: 'a@b.com',
         username: 'user@name!',
         password: 'password123',
      });
      expect(result.success).toBe(false);
   });

   it('should accept username with underscores', () => {
      const result = registerSchema.safeParse({
         email: 'a@b.com',
         username: 'user_name_123',
         password: 'password123',
      });
      expect(result.success).toBe(true);
   });

   it('should reject short password (< 8)', () => {
      const result = registerSchema.safeParse({
         email: 'a@b.com',
         username: 'user123',
         password: '1234567',
      });
      expect(result.success).toBe(false);
   });

   it('should reject long password (> 128)', () => {
      const result = registerSchema.safeParse({
         email: 'a@b.com',
         username: 'user123',
         password: 'a'.repeat(129),
      });
      expect(result.success).toBe(false);
   });
});

describe('loginSchema', () => {
   it('should accept valid email and non-empty password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
   });

   it('should reject empty password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
   });
});

describe('updateProfileSchema', () => {
   it('should accept partial fields', () => {
      expect(updateProfileSchema.safeParse({ goal: 'BULK' }).success).toBe(true);
      expect(updateProfileSchema.safeParse({}).success).toBe(true);
   });

   it('should accept valid goal enum values', () => {
      for (const goal of ['BULK', 'CUT', 'MAINTAIN']) {
         expect(updateProfileSchema.safeParse({ goal }).success).toBe(true);
      }
   });

   it('should reject invalid goal values', () => {
      expect(updateProfileSchema.safeParse({ goal: 'INVALID' }).success).toBe(false);
   });

   it('should accept nullable fields', () => {
      expect(updateProfileSchema.safeParse({ goal: null, initialWeight: null }).success).toBe(true);
   });
});

describe('workoutPlanExerciseSchema', () => {
   const valid = {
      exerciseId: '550e8400-e29b-41d4-a716-446655440000',
      sets: 3,
      reps: '10',
      order: 0,
   };

   it('should accept valid input with defaults', () => {
      const result = workoutPlanExerciseSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.restSeconds).toBe(60);
   });

   it('should reject sets < 1', () => {
      expect(workoutPlanExerciseSchema.safeParse({ ...valid, sets: 0 }).success).toBe(false);
   });

   it('should reject sets > 20', () => {
      expect(workoutPlanExerciseSchema.safeParse({ ...valid, sets: 21 }).success).toBe(false);
   });

   it('should reject restSeconds < 0', () => {
      expect(workoutPlanExerciseSchema.safeParse({ ...valid, restSeconds: -1 }).success).toBe(false);
   });

   it('should reject restSeconds > 600', () => {
      expect(workoutPlanExerciseSchema.safeParse({ ...valid, restSeconds: 601 }).success).toBe(false);
   });

   it('should reject invalid exerciseId (not a UUID)', () => {
      expect(workoutPlanExerciseSchema.safeParse({ ...valid, exerciseId: 'not-uuid' }).success).toBe(false);
   });
});

describe('createWorkoutLogSchema', () => {
   const validExercise = {
      exerciseId: '550e8400-e29b-41d4-a716-446655440000',
      order: 0,
      sets: [{ setNumber: 1, reps: 10, weight: 60 }],
   };

   it('should accept valid log', () => {
      const result = createWorkoutLogSchema.safeParse({ exercises: [validExercise] });
      expect(result.success).toBe(true);
   });

   it('should default isComplete to false', () => {
      const result = createWorkoutLogSchema.safeParse({ exercises: [validExercise] });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.isComplete).toBe(false);
   });

   it('should reject when endTime <= startTime', () => {
      const result = createWorkoutLogSchema.safeParse({
         exercises: [validExercise],
         startTime: '2024-01-15T10:00:00.000Z',
         endTime: '2024-01-15T10:00:00.000Z', // equal
      });
      expect(result.success).toBe(false);
   });

   it('should reject when endTime < startTime', () => {
      const result = createWorkoutLogSchema.safeParse({
         exercises: [validExercise],
         startTime: '2024-01-15T10:00:00.000Z',
         endTime: '2024-01-15T09:00:00.000Z', // before
      });
      expect(result.success).toBe(false);
   });

   it('should pass when endTime > startTime', () => {
      const result = createWorkoutLogSchema.safeParse({
         exercises: [validExercise],
         startTime: '2024-01-15T10:00:00.000Z',
         endTime: '2024-01-15T11:00:00.000Z',
      });
      expect(result.success).toBe(true);
   });

   it('should pass when only startTime is provided', () => {
      const result = createWorkoutLogSchema.safeParse({
         exercises: [validExercise],
         startTime: '2024-01-15T10:00:00.000Z',
      });
      expect(result.success).toBe(true);
   });

   it('should pass when neither startTime nor endTime is provided', () => {
      const result = createWorkoutLogSchema.safeParse({
         exercises: [validExercise],
      });
      expect(result.success).toBe(true);
   });

   it('should reject notes > 1000 chars', () => {
      const result = createWorkoutLogSchema.safeParse({
         exercises: [validExercise],
         notes: 'x'.repeat(1001),
      });
      expect(result.success).toBe(false);
   });
});

describe('workoutLogSetSchema', () => {
   it('should accept valid set', () => {
      expect(workoutLogSetSchema.safeParse({ setNumber: 1, reps: 10, weight: 60 }).success).toBe(true);
   });

   it('should reject setNumber < 1', () => {
      expect(workoutLogSetSchema.safeParse({ setNumber: 0, reps: 10, weight: 60 }).success).toBe(false);
   });

   it('should accept reps = 0', () => {
      expect(workoutLogSetSchema.safeParse({ setNumber: 1, reps: 0, weight: 60 }).success).toBe(true);
   });

   it('should accept weight = 0', () => {
      expect(workoutLogSetSchema.safeParse({ setNumber: 1, reps: 10, weight: 0 }).success).toBe(true);
   });

   it('should reject negative weight', () => {
      expect(workoutLogSetSchema.safeParse({ setNumber: 1, reps: 10, weight: -5 }).success).toBe(false);
   });
});

describe('createBodyWeightSchema', () => {
   it('should accept positive weight', () => {
      expect(createBodyWeightSchema.safeParse({ weight: 80.5 }).success).toBe(true);
   });

   it('should reject zero weight', () => {
      expect(createBodyWeightSchema.safeParse({ weight: 0 }).success).toBe(false);
   });

   it('should reject negative weight', () => {
      expect(createBodyWeightSchema.safeParse({ weight: -5 }).success).toBe(false);
   });

   it('should accept optional date', () => {
      expect(createBodyWeightSchema.safeParse({
         weight: 80,
         date: '2024-01-15T10:00:00.000Z',
      }).success).toBe(true);
   });
});

describe('paginationSchema', () => {
   it('should default page to 1 and limit to 20', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
         expect(result.data.page).toBe(1);
         expect(result.data.limit).toBe(20);
      }
   });

   it('should coerce string values to numbers', () => {
      const result = paginationSchema.safeParse({ page: '3', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
         expect(result.data.page).toBe(3);
         expect(result.data.limit).toBe(50);
      }
   });

   it('should reject page < 1', () => {
      expect(paginationSchema.safeParse({ page: '0' }).success).toBe(false);
   });

   it('should reject limit > 300', () => {
      expect(paginationSchema.safeParse({ limit: '301' }).success).toBe(false);
   });

   it('should reject limit < 1', () => {
      expect(paginationSchema.safeParse({ limit: '0' }).success).toBe(false);
   });
});

describe('exerciseQuerySchema', () => {
   it('should preserve filter params alongside pagination', () => {
      const result = exerciseQuerySchema.safeParse({
         page: '1', limit: '20', muscleGroup: 'CHEST', search: 'bench',
      });
      expect(result.success).toBe(true);
      if (result.success) {
         expect(result.data.muscleGroup).toBe('CHEST');
         expect(result.data.search).toBe('bench');
      }
   });
});

describe('workoutLogQuerySchema', () => {
   it('should preserve filter params alongside pagination', () => {
      const result = workoutLogQuerySchema.safeParse({
         page: '1', limit: '20', startDate: '2024-01-01', exerciseId: 'abc',
      });
      expect(result.success).toBe(true);
      if (result.success) {
         expect(result.data.startDate).toBe('2024-01-01');
         expect(result.data.exerciseId).toBe('abc');
      }
   });
});

// ========== createWorkoutPlanSchema ==========
describe('createWorkoutPlanSchema', () => {
   it('should accept valid plan with name only', () => {
      const result = createWorkoutPlanSchema.safeParse({ name: 'Push Day' });
      expect(result.success).toBe(true);
   });

   it('should accept plan with description and exercises', () => {
      const result = createWorkoutPlanSchema.safeParse({
         name: 'Push Day',
         description: 'Chest/shoulders/triceps',
         exercises: [{
            exerciseId: '550e8400-e29b-41d4-a716-446655440000',
            sets: 3,
            reps: '10',
            order: 0,
         }],
      });
      expect(result.success).toBe(true);
   });

   it('should reject empty name', () => {
      expect(createWorkoutPlanSchema.safeParse({ name: '' }).success).toBe(false);
   });

   it('should reject name > 100 characters', () => {
      expect(createWorkoutPlanSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false);
   });

   it('should reject description > 500 characters', () => {
      expect(createWorkoutPlanSchema.safeParse({
         name: 'Plan',
         description: 'x'.repeat(501),
      }).success).toBe(false);
   });

   it('should accept plan without exercises (optional)', () => {
      const result = createWorkoutPlanSchema.safeParse({ name: 'Plan' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.exercises).toBeUndefined();
   });
});

// ========== updateWorkoutPlanSchema ==========
describe('updateWorkoutPlanSchema', () => {
   it('should accept empty object (all optional)', () => {
      expect(updateWorkoutPlanSchema.safeParse({}).success).toBe(true);
   });

   it('should accept partial fields', () => {
      expect(updateWorkoutPlanSchema.safeParse({ name: 'New Name' }).success).toBe(true);
   });

   it('should accept nullable description', () => {
      expect(updateWorkoutPlanSchema.safeParse({ description: null }).success).toBe(true);
   });

   it('should accept isArchived boolean', () => {
      expect(updateWorkoutPlanSchema.safeParse({ isArchived: true }).success).toBe(true);
   });

   it('should reject isArchived non-boolean', () => {
      expect(updateWorkoutPlanSchema.safeParse({ isArchived: 'yes' }).success).toBe(false);
   });

   it('should accept exercises array', () => {
      const result = updateWorkoutPlanSchema.safeParse({
         exercises: [{
            exerciseId: '550e8400-e29b-41d4-a716-446655440000',
            sets: 3,
            reps: '10',
            order: 0,
         }],
      });
      expect(result.success).toBe(true);
   });

   it('should reject invalid exercise in array', () => {
      const result = updateWorkoutPlanSchema.safeParse({
         exercises: [{ exerciseId: 'not-uuid', sets: 3, reps: '10', order: 0 }],
      });
      expect(result.success).toBe(false);
   });
});

// ========== updateWorkoutLogSchema ==========
describe('updateWorkoutLogSchema', () => {
   it('should accept empty object (all optional)', () => {
      expect(updateWorkoutLogSchema.safeParse({}).success).toBe(true);
   });

   it('should accept isComplete boolean', () => {
      expect(updateWorkoutLogSchema.safeParse({ isComplete: true }).success).toBe(true);
   });

   it('should accept nullable notes', () => {
      expect(updateWorkoutLogSchema.safeParse({ notes: null }).success).toBe(true);
   });

   it('should accept nullable endTime', () => {
      expect(updateWorkoutLogSchema.safeParse({ endTime: null }).success).toBe(true);
   });

   it('should accept nullable workoutPlanId', () => {
      expect(updateWorkoutLogSchema.safeParse({ workoutPlanId: null }).success).toBe(true);
   });

   it('should accept exercises with valid sets', () => {
      const result = updateWorkoutLogSchema.safeParse({
         exercises: [{
            exerciseId: '550e8400-e29b-41d4-a716-446655440000',
            order: 0,
            sets: [{ setNumber: 1, reps: 10, weight: 60 }],
         }],
      });
      expect(result.success).toBe(true);
   });

   it('should reject exercises with empty sets (min 1)', () => {
      const result = updateWorkoutLogSchema.safeParse({
         exercises: [{
            exerciseId: '550e8400-e29b-41d4-a716-446655440000',
            order: 0,
            sets: [],
         }],
      });
      expect(result.success).toBe(false);
   });

   it('should reject exercises with invalid exerciseId', () => {
      const result = updateWorkoutLogSchema.safeParse({
         exercises: [{
            exerciseId: 'not-uuid',
            order: 0,
            sets: [{ setNumber: 1, reps: 10, weight: 60 }],
         }],
      });
      expect(result.success).toBe(false);
   });

   it('should reject notes > 1000 characters', () => {
      expect(updateWorkoutLogSchema.safeParse({ notes: 'x'.repeat(1001) }).success).toBe(false);
   });
});

// ========== workoutLogExerciseSchema ==========
describe('workoutLogExerciseSchema', () => {
   const validSet = { setNumber: 1, reps: 10, weight: 60 };

   it('should accept valid exercise entry', () => {
      const result = workoutLogExerciseSchema.safeParse({
         exerciseId: '550e8400-e29b-41d4-a716-446655440000',
         order: 0,
         sets: [validSet],
      });
      expect(result.success).toBe(true);
   });

   it('should reject invalid UUID exerciseId', () => {
      const result = workoutLogExerciseSchema.safeParse({
         exerciseId: 'not-a-uuid',
         order: 0,
         sets: [validSet],
      });
      expect(result.success).toBe(false);
   });

   it('should reject negative order', () => {
      const result = workoutLogExerciseSchema.safeParse({
         exerciseId: '550e8400-e29b-41d4-a716-446655440000',
         order: -1,
         sets: [validSet],
      });
      expect(result.success).toBe(false);
   });

   it('should reject notes > 500 characters', () => {
      const result = workoutLogExerciseSchema.safeParse({
         exerciseId: '550e8400-e29b-41d4-a716-446655440000',
         order: 0,
         notes: 'x'.repeat(501),
         sets: [validSet],
      });
      expect(result.success).toBe(false);
   });

   it('should accept optional notes', () => {
      const result = workoutLogExerciseSchema.safeParse({
         exerciseId: '550e8400-e29b-41d4-a716-446655440000',
         order: 0,
         notes: 'Focus on form',
         sets: [validSet],
      });
      expect(result.success).toBe(true);
   });
});

// ========== workoutPlanQuerySchema ==========
describe('workoutPlanQuerySchema', () => {
   it('should accept includeArchived string param', () => {
      const result = workoutPlanQuerySchema.safeParse({ includeArchived: 'true' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.includeArchived).toBe('true');
   });

   it('should default pagination when no params', () => {
      const result = workoutPlanQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
         expect(result.data.page).toBe(1);
         expect(result.data.limit).toBe(20);
      }
   });
});
