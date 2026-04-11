import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiWorkoutService } from '../../services/aiWorkoutService';

vi.mock('../../config', () => ({
   config: { geminiApiKey: 'test-key' },
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
   name: 'Peito e Tríceps',
   exercises: [
      { exerciseId: 'ex-1', sets: 4, reps: '8-12', restSeconds: 90, order: 0 },
   ],
};

const mockExerciseRepo = { findAll: vi.fn() };
const mockUserRepo = { findById: vi.fn() };
const mockPlanService = { create: vi.fn() };
const mockGenerateContent = vi.fn();

vi.mock('../../repositories/exerciseRepository', () => ({
   exerciseRepository: { findAll: (...args: any[]) => mockExerciseRepo.findAll(...args) },
}));

vi.mock('../../repositories/userRepository', () => ({
   userRepository: { findById: (...args: any[]) => mockUserRepo.findById(...args) },
}));

vi.mock('../../services/workoutPlanService', () => ({
   workoutPlanService: { create: (...args: any[]) => mockPlanService.create(...args) },
}));

vi.mock('@google/generative-ai', () => ({
   GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
         generateContent: mockGenerateContent,
      }),
   })),
}));

describe('aiWorkoutService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      mockExerciseRepo.findAll.mockResolvedValue([mockExercises, mockExercises.length]);
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockGenerateContent.mockResolvedValue({
         response: { text: () => JSON.stringify(mockAiResponse) },
      });
      mockPlanService.create.mockResolvedValue({ id: 'plan-1', ...mockAiResponse });
   });

   it('should generate a workout plan', async () => {
      const result = await aiWorkoutService.generate('user-1', {
         level: 'INTERMEDIATE',
         focus: 'Peito e Tríceps',
      });

      expect(result).toHaveProperty('id', 'plan-1');
      expect(mockExerciseRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 300 });
      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(mockPlanService.create).toHaveBeenCalledWith('user-1', {
         name: 'Peito e Tríceps',
         exercises: mockAiResponse.exercises,
      });
   });

   it('should filter out invalid exerciseIds from AI response', async () => {
      mockGenerateContent.mockResolvedValue({
         response: {
            text: () => JSON.stringify({
               name: 'Test',
               exercises: [
                  { exerciseId: 'ex-1', sets: 3, reps: '10', restSeconds: 60, order: 0 },
                  { exerciseId: 'invalid-id', sets: 3, reps: '10', restSeconds: 60, order: 1 },
               ],
            }),
         },
      });

      await aiWorkoutService.generate('user-1', { level: 'BEGINNER', focus: 'Pernas' });

      expect(mockPlanService.create).toHaveBeenCalledWith('user-1', {
         name: 'Test',
         exercises: [{ exerciseId: 'ex-1', sets: 3, reps: '10', restSeconds: 60, order: 0 }],
      });
   });

   it('should throw if API key is not configured', async () => {
      const { config } = await import('../../config');
      const original = config.geminiApiKey;
      (config as any).geminiApiKey = '';

      await expect(
         aiWorkoutService.generate('user-1', { level: 'BEGINNER', focus: 'Costas' }),
      ).rejects.toThrow('Gemini API key not configured');

      (config as any).geminiApiKey = original;
   });

   it('should retry on invalid AI response and fail after 2 attempts', async () => {
      mockGenerateContent.mockResolvedValue({
         response: { text: () => 'not valid json {{{' },
      });

      await expect(
         aiWorkoutService.generate('user-1', { level: 'BEGINNER', focus: 'Peito' }),
      ).rejects.toThrow('Failed to generate valid workout plan from AI');

      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
   });

   it('should pass focus and description to the prompt when provided', async () => {
      await aiWorkoutService.generate('user-1', {
         level: 'ADVANCED',
         focus: 'Peito e costas',
         description: 'Prefiro halteres',
      });

      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('Peito e costas');
      expect(prompt).toContain('Prefiro halteres');
   });
});
