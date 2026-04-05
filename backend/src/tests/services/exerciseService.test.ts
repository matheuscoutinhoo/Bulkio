import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exerciseService } from '../../services/exerciseService';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { createMockExercise } from '../helpers';

vi.mock('../../repositories/exerciseRepository', () => ({
   exerciseRepository: {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getMuscleGroups: vi.fn(),
   },
}));

import { exerciseRepository } from '../../repositories/exerciseRepository';

const mockRepo = vi.mocked(exerciseRepository);

describe('exerciseService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated exercises', async () => {
         const exercises = [createMockExercise()];
         mockRepo.findAll.mockResolvedValue([exercises, 1] as any);

         const result = await exerciseService.findAll('user-1', { page: 1, limit: 20 });

         expect(result.exercises).toEqual(exercises);
         expect(result.total).toBe(1);
         expect(result.page).toBe(1);
         expect(result.totalPages).toBe(1);
      });

      it('should calculate totalPages correctly', async () => {
         mockRepo.findAll.mockResolvedValue([[], 55] as any);

         const result = await exerciseService.findAll('user-1', { page: 1, limit: 20 });

         expect(result.totalPages).toBe(3); // ceil(55/20) = 3
      });

      it('should pass filters to repository', async () => {
         mockRepo.findAll.mockResolvedValue([[], 0] as any);

         await exerciseService.findAll('user-1', {
            page: 1, limit: 20, muscleGroup: 'CHEST', search: 'bench',
         });

         expect(mockRepo.findAll).toHaveBeenCalledWith(
            expect.objectContaining({ muscleGroup: 'CHEST', search: 'bench', userId: 'user-1' }),
         );
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return exercise when it exists and is not custom', async () => {
         const exercise = createMockExercise({ isCustom: false });
         mockRepo.findById.mockResolvedValue(exercise as any);

         const result = await exerciseService.findById('user-1', 'exercise-1');

         expect(result).toEqual(exercise);
      });

      it('should return custom exercise when it belongs to the requesting user', async () => {
         const exercise = createMockExercise({ isCustom: true, userId: 'user-1' });
         mockRepo.findById.mockResolvedValue(exercise as any);

         const result = await exerciseService.findById('user-1', 'exercise-1');

         expect(result).toEqual(exercise);
      });

      it('should throw NotFoundError when exercise does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(exerciseService.findById('user-1', 'missing')).rejects.toThrow('Exercise not found');
      });

      it('should throw ForbiddenError when exercise is custom and belongs to another user', async () => {
         const exercise = createMockExercise({ isCustom: true, userId: 'other-user' });
         mockRepo.findById.mockResolvedValue(exercise as any);

         await expect(exerciseService.findById('user-1', 'exercise-1')).rejects.toThrow(/custom exercise/);
      });
   });

   // ========== create ==========
   describe('create', () => {
      it('should create a custom exercise with isCustom true', async () => {
         const input = { name: 'My Exercise', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' };
         mockRepo.create.mockResolvedValue(createMockExercise({ ...input, isCustom: true, userId: 'user-1' }) as any);

         await exerciseService.create('user-1', input as any);

         expect(mockRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({ isCustom: true, userId: 'user-1' }),
         );
      });
   });

   // ========== update ==========
   describe('update', () => {
      it('should update exercise when it is custom and belongs to user', async () => {
         const exercise = createMockExercise({ isCustom: true, userId: 'user-1' });
         mockRepo.findById.mockResolvedValue(exercise as any);
         mockRepo.update.mockResolvedValue({ ...exercise, name: 'Updated' } as any);

         const result = await exerciseService.update('user-1', 'exercise-1', { name: 'Updated' } as any);

         expect(result.name).toBe('Updated');
      });

      it('should throw NotFoundError when exercise does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(
            exerciseService.update('user-1', 'missing', { name: 'X' } as any),
         ).rejects.toThrow('Exercise not found');
      });

      it('should throw ForbiddenError when exercise is not custom', async () => {
         mockRepo.findById.mockResolvedValue(createMockExercise({ isCustom: false }) as any);

         await expect(
            exerciseService.update('user-1', 'exercise-1', { name: 'X' } as any),
         ).rejects.toThrow('Can only edit your own custom exercises');
      });

      it('should throw ForbiddenError when exercise is custom but belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(
            createMockExercise({ isCustom: true, userId: 'other-user' }) as any,
         );

         await expect(
            exerciseService.update('user-1', 'exercise-1', { name: 'X' } as any),
         ).rejects.toThrow('Can only edit your own custom exercises');
      });
   });

   // ========== delete ==========
   describe('delete', () => {
      it('should delete exercise when it is custom and belongs to user', async () => {
         mockRepo.findById.mockResolvedValue(
            createMockExercise({ isCustom: true, userId: 'user-1' }) as any,
         );
         mockRepo.delete.mockResolvedValue(undefined as any);

         await expect(exerciseService.delete('user-1', 'exercise-1')).resolves.not.toThrow();
      });

      it('should throw NotFoundError when exercise does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(exerciseService.delete('user-1', 'missing')).rejects.toThrow('Exercise not found');
      });

      it('should throw ForbiddenError when exercise is not custom', async () => {
         mockRepo.findById.mockResolvedValue(createMockExercise({ isCustom: false }) as any);

         await expect(exerciseService.delete('user-1', 'exercise-1')).rejects.toThrow(/custom exercises/);
      });

      it('should throw ForbiddenError when exercise belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(
            createMockExercise({ isCustom: true, userId: 'other-user' }) as any,
         );

         await expect(exerciseService.delete('user-1', 'exercise-1')).rejects.toThrow(/custom exercises/);
      });
   });

   // ========== getMuscleGroups ==========
   describe('getMuscleGroups', () => {
      it('should return flat array of muscle group strings', async () => {
         mockRepo.getMuscleGroups.mockResolvedValue([
            { muscleGroup: 'CHEST' },
            { muscleGroup: 'BACK' },
         ] as any);

         const result = await exerciseService.getMuscleGroups();

         expect(result).toEqual(['CHEST', 'BACK']);
      });
   });
});
