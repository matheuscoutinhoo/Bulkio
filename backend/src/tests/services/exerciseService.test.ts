import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exerciseService } from '../../services/exerciseService';
import { NotFoundError } from '../../utils/errors';
import { createMockExercise } from '../helpers';

vi.mock('../../repositories/exerciseRepository', () => ({
   exerciseRepository: {
      findAll: vi.fn(),
      findById: vi.fn(),
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

         const result = await exerciseService.findAll({ page: 1, limit: 20 });

         expect(result.exercises).toEqual(exercises);
         expect(result.total).toBe(1);
         expect(result.page).toBe(1);
         expect(result.totalPages).toBe(1);
      });

      it('should calculate totalPages correctly', async () => {
         mockRepo.findAll.mockResolvedValue([[], 55] as any);

         const result = await exerciseService.findAll({ page: 1, limit: 20 });

         expect(result.totalPages).toBe(3); // ceil(55/20) = 3
      });

      it('should pass filters to repository', async () => {
         mockRepo.findAll.mockResolvedValue([[], 0] as any);

         await exerciseService.findAll({
            page: 1, limit: 20, muscleGroup: 'CHEST', search: 'bench',
         });

         expect(mockRepo.findAll).toHaveBeenCalledWith(
            expect.objectContaining({ muscleGroup: 'CHEST', search: 'bench' }),
         );
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return exercise when it exists', async () => {
         const exercise = createMockExercise();
         mockRepo.findById.mockResolvedValue(exercise as any);

         const result = await exerciseService.findById('exercise-1');

         expect(result).toEqual(exercise);
      });

      it('should throw NotFoundError when exercise does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(exerciseService.findById('missing')).rejects.toThrow('Exercise not found');
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
