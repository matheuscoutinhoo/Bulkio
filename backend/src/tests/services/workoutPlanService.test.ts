import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workoutPlanService } from '../../services/workoutPlanService';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { createMockWorkoutPlan } from '../helpers';

vi.mock('../../repositories/workoutPlanRepository', () => ({
   workoutPlanRepository: {
      findAllByUser: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      duplicate: vi.fn(),
      delete: vi.fn(),
   },
}));

import { workoutPlanRepository } from '../../repositories/workoutPlanRepository';

const mockRepo = vi.mocked(workoutPlanRepository);

describe('workoutPlanService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated plans', async () => {
         const plans = [createMockWorkoutPlan()];
         mockRepo.findAllByUser.mockResolvedValue([plans, 1] as any);

         const result = await workoutPlanService.findAll('user-1', false, 1, 20);

         expect(result.plans).toEqual(plans);
         expect(result.total).toBe(1);
         expect(result.totalPages).toBe(1);
      });

      it('should pass includeArchived flag to repository', async () => {
         mockRepo.findAllByUser.mockResolvedValue([[], 0] as any);

         await workoutPlanService.findAll('user-1', true, 1, 20);

         expect(mockRepo.findAllByUser).toHaveBeenCalledWith('user-1', true, 1, 20);
      });

      it('should calculate totalPages correctly', async () => {
         mockRepo.findAllByUser.mockResolvedValue([[], 45] as any);

         const result = await workoutPlanService.findAll('user-1', false, 1, 20);

         expect(result.totalPages).toBe(3); // ceil(45/20)
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return plan when it exists and belongs to user', async () => {
         const plan = createMockWorkoutPlan();
         mockRepo.findById.mockResolvedValue(plan as any);

         const result = await workoutPlanService.findById('user-1', 'plan-1');

         expect(result).toEqual(plan);
      });

      it('should throw NotFoundError when plan does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(workoutPlanService.findById('user-1', 'missing')).rejects.toThrow('Workout plan not found');
      });

      it('should throw ForbiddenError when plan belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan({ userId: 'other-user' }) as any);

         await expect(workoutPlanService.findById('user-1', 'plan-1')).rejects.toThrow('Forbidden');
      });
   });

   // ========== create ==========
   describe('create', () => {
      it('should create a workout plan', async () => {
         const plan = createMockWorkoutPlan();
         mockRepo.create.mockResolvedValue(plan as any);

         const result = await workoutPlanService.create('user-1', { name: 'Push Day' } as any);

         expect(mockRepo.create).toHaveBeenCalledWith('user-1', { name: 'Push Day' });
         expect(result).toEqual(plan);
      });
   });

   // ========== update ==========
   describe('update', () => {
      it('should update plan when it belongs to user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan() as any);
         const updated = createMockWorkoutPlan({ name: 'Updated' });
         mockRepo.update.mockResolvedValue(updated as any);

         const result = await workoutPlanService.update('user-1', 'plan-1', { name: 'Updated' } as any);

         expect(result.name).toBe('Updated');
      });

      it('should throw NotFoundError when plan does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(
            workoutPlanService.update('user-1', 'missing', { name: 'X' } as any),
         ).rejects.toThrow('Workout plan not found');
      });

      it('should throw ForbiddenError when plan belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan({ userId: 'other' }) as any);

         await expect(
            workoutPlanService.update('user-1', 'plan-1', { name: 'X' } as any),
         ).rejects.toThrow('Forbidden');
      });
   });

   // ========== duplicate ==========
   describe('duplicate', () => {
      it('should duplicate plan when it belongs to user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan() as any);
         const dupe = createMockWorkoutPlan({ id: 'plan-2', name: 'Push Day (Copy)' });
         mockRepo.duplicate.mockResolvedValue(dupe as any);

         const result = await workoutPlanService.duplicate('user-1', 'plan-1');

         expect(result.name).toBe('Push Day (Copy)');
      });

      it('should throw NotFoundError when plan does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(workoutPlanService.duplicate('user-1', 'missing')).rejects.toThrow('Workout plan not found');
      });

      it('should throw ForbiddenError when plan belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan({ userId: 'other' }) as any);

         await expect(workoutPlanService.duplicate('user-1', 'plan-1')).rejects.toThrow('Forbidden');
      });
   });

   // ========== archive ==========
   describe('archive', () => {
      it('should archive plan when it belongs to user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan() as any);
         mockRepo.delete.mockResolvedValue(undefined as any);

         await expect(workoutPlanService.archive('user-1', 'plan-1')).resolves.not.toThrow();
      });

      it('should throw NotFoundError when plan does not exist', async () => {
         mockRepo.findById.mockResolvedValue(null);

         await expect(workoutPlanService.archive('user-1', 'missing')).rejects.toThrow('Workout plan not found');
      });

      it('should throw ForbiddenError when plan belongs to another user', async () => {
         mockRepo.findById.mockResolvedValue(createMockWorkoutPlan({ userId: 'other' }) as any);

         await expect(workoutPlanService.archive('user-1', 'plan-1')).rejects.toThrow('Forbidden');
      });
   });
});
