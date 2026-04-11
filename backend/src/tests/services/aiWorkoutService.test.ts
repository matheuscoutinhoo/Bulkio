import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiWorkoutService } from '../../services/aiWorkoutService';

vi.mock('../../config', () => ({
   config: { llmApiKey: 'test-key', llmBaseUrl: 'https://test.api/v1', llmModel: 'test-model' },
}));

vi.mock('../../config/logger', () => ({
   logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const mockExercises = [
   { id: 'ex-1', name: 'Supino Reto', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
   { id: 'ex-2', name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE' },
   { id: 'ex-3', name: 'Agachamento', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL' },
];

const mockUser = {
   id: 'user-1',
   email: 'test@test.com',
   username: 'test',
   goal: 'BULK',
   initialWeight: 80,
   targetWeight: 85,
   height: 180,
   createdAt: new Date(),
   updatedAt: new Date(),
};

const mockAiResponse = {
   e: [
      { i: 0, s: 4, r: '8-12', d: 90 },
   ],
};

const mockExerciseRepo = { findAll: vi.fn() };
const mockUserRepo = { findById: vi.fn() };
const mockPlanService = { create: vi.fn() };
const mockFetch = vi.fn();

vi.mock('../../repositories/exerciseRepository', () => ({
   exerciseRepository: { findAll: (...args: any[]) => mockExerciseRepo.findAll(...args) },
}));

vi.mock('../../repositories/userRepository', () => ({
   userRepository: { findById: (...args: any[]) => mockUserRepo.findById(...args) },
}));

vi.mock('../../services/workoutPlanService', () => ({
   workoutPlanService: { create: (...args: any[]) => mockPlanService.create(...args) },
}));

// Mock global fetch
vi.stubGlobal('fetch', mockFetch);

function mockFetchResponse(body: object, status = 200) {
   return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(body) } }] }),
      text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(body) } }] }),
   };
}

describe('aiWorkoutService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      mockExerciseRepo.findAll.mockResolvedValue([mockExercises, mockExercises.length]);
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockFetch.mockResolvedValue(mockFetchResponse(mockAiResponse));
      mockPlanService.create.mockResolvedValue({ id: 'plan-1', ...mockAiResponse });
   });

   it('should generate a workout plan', async () => {
      const result = await aiWorkoutService.generate('user-1', {
         level: 'INTERMEDIATE',
         focus: 'Peito e Tríceps',
      });

      expect(result).toHaveProperty('id', 'plan-1');
      expect(mockExerciseRepo.findAll).toHaveBeenCalledWith(
         expect.objectContaining({ page: 1, limit: 80, muscleGroups: expect.any(Array) }),
      );
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(mockPlanService.create).toHaveBeenCalledWith('user-1', {
         name: 'Treino de Peito e Tríceps',
         exercises: [{ exerciseId: 'ex-1', sets: 4, reps: '8-12', restSeconds: 90, order: 0 }],
      });
   });

   it('should filter out invalid exercise indices from AI response', async () => {
      mockFetch.mockResolvedValue(mockFetchResponse({
         e: [
            { i: 0, s: 3, r: '10', d: 60 },
            { i: 999, s: 3, r: '10', d: 60 },
         ],
      }));

      await aiWorkoutService.generate('user-1', { level: 'BEGINNER', focus: 'Pernas' });

      expect(mockPlanService.create).toHaveBeenCalledWith('user-1', {
         name: 'Treino de Pernas',
         exercises: [{ exerciseId: 'ex-1', sets: 3, reps: '10', restSeconds: 60, order: 0 }],
      });
   });

   it('should throw if API key is not configured', async () => {
      const { config } = await import('../../config');
      const original = config.llmApiKey;
      (config as any).llmApiKey = '';

      await expect(
         aiWorkoutService.generate('user-1', { level: 'BEGINNER', focus: 'Costas' }),
      ).rejects.toThrow('LLM API key not configured');

      (config as any).llmApiKey = original;
   });

   it('should retry on invalid AI response and fail after 2 attempts', async () => {
      mockFetch.mockResolvedValue({
         ok: true,
         status: 200,
         json: async () => ({ choices: [{ message: { content: 'not valid json {{{' } }] }),
      });

      await expect(
         aiWorkoutService.generate('user-1', { level: 'BEGINNER', focus: 'Peito' }),
      ).rejects.toThrow('Failed to generate valid workout plan from AI');

      expect(mockFetch).toHaveBeenCalledTimes(2);
   });

   it('should pass focus and description to the prompt when provided', async () => {
      await aiWorkoutService.generate('user-1', {
         level: 'ADVANCED',
         focus: 'Peito e costas',
         description: 'Prefiro halteres',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const prompt = callBody.messages[0].content;
      expect(prompt).toContain('Peito e costas');
      expect(prompt).toContain('Prefiro halteres');
   });
});
