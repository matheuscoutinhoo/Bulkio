import { vi } from 'vitest';

// ---- Factory helpers ----

export function createMockUser(overrides: Record<string, unknown> = {}) {
   return {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      password: '$2b$12$hashedpassword',
      goal: null,
      initialWeight: null,
      targetWeight: null,
      height: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
   };
}

export function createMockExercise(overrides: Record<string, unknown> = {}) {
   return {
      id: 'exercise-1',
      name: 'Bench Press',
      muscleGroup: 'CHEST',
      type: 'COMPOUND',
      equipment: 'BARBELL',
      description: 'Flat bench press',
      createdAt: new Date('2024-01-01'),
      ...overrides,
   };
}

export function createMockWorkoutPlan(overrides: Record<string, unknown> = {}) {
   return {
      id: 'plan-1',
      name: 'Push Day',
      description: null,
      userId: 'user-1',
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      exercises: [],
      ...overrides,
   };
}

export function createMockWorkoutLog(overrides: Record<string, unknown> = {}) {
   return {
      id: 'log-1',
      userId: 'user-1',
      workoutPlanId: null,
      date: new Date('2024-01-15'),
      startTime: null,
      endTime: null,
      isComplete: true,
      notes: null,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      exercises: [],
      ...overrides,
   };
}

export function createMockBodyWeight(overrides: Record<string, unknown> = {}) {
   return {
      id: 'bw-1',
      userId: 'user-1',
      weight: 80,
      date: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      ...overrides,
   };
}

export function createMockPR(overrides: Record<string, unknown> = {}) {
   return {
      id: 'pr-1',
      userId: 'user-1',
      exerciseId: 'exercise-1',
      weight: 100,
      reps: 5,
      date: new Date('2024-01-15'),
      exercise: createMockExercise(),
      ...overrides,
   };
}

// ---- Mock request/response helpers ----

export function mockRequest(overrides: Record<string, unknown> = {}) {
   return {
      body: {},
      params: {},
      query: {},
      headers: {},
      cookies: {},
      user: undefined,
      ...overrides,
   } as any;
}

export function mockResponse() {
   const res: any = {};
   res.status = vi.fn().mockReturnThis();
   res.json = vi.fn().mockReturnThis();
   res.cookie = vi.fn().mockReturnThis();
   res.clearCookie = vi.fn().mockReturnThis();
   return res;
}

export function mockNext() {
   return vi.fn();
}
