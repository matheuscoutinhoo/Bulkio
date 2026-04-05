import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workoutLogService } from '../../services/workoutLogService';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { createMockWorkoutLog, createMockWorkoutPlan, createMockPR } from '../helpers';

vi.mock('../../repositories/workoutLogRepository', () => ({
   workoutLogRepository: {
      findAllByUser: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
   },
}));

vi.mock('../../repositories/personalRecordRepository', () => ({
   personalRecordRepository: {
      findByUserAndExercise: vi.fn(),
      upsert: vi.fn(),
   },
}));

vi.mock('../../repositories/workoutPlanRepository', () => ({
   workoutPlanRepository: {
      findById: vi.fn(),
   },
}));

import { workoutLogRepository } from '../../repositories/workoutLogRepository';
import { personalRecordRepository } from '../../repositories/personalRecordRepository';
import { workoutPlanRepository } from '../../repositories/workoutPlanRepository';

const mockLogRepo = vi.mocked(workoutLogRepository);
const mockPRRepo = vi.mocked(personalRecordRepository);
const mockPlanRepo = vi.mocked(workoutPlanRepository);

describe('workoutLogService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated logs', async () => {
         const logs = [createMockWorkoutLog()];
         mockLogRepo.findAllByUser.mockResolvedValue([logs, 1] as any);

         const result = await workoutLogService.findAll('user-1', { page: 1, limit: 20 });

         expect(result.logs).toEqual(logs);
         expect(result.total).toBe(1);
         expect(result.totalPages).toBe(1);
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return log when it exists and belongs to user', async () => {
         const log = createMockWorkoutLog();
         mockLogRepo.findById.mockResolvedValue(log as any);

         const result = await workoutLogService.findById('user-1', 'log-1');

         expect(result).toEqual(log);
      });

      it('should throw NotFoundError when log does not exist', async () => {
         mockLogRepo.findById.mockResolvedValue(null);

         await expect(workoutLogService.findById('user-1', 'missing')).rejects.toThrow('Workout log not found');
      });

      it('should throw ForbiddenError when log belongs to another user', async () => {
         mockLogRepo.findById.mockResolvedValue(
            createMockWorkoutLog({ userId: 'other-user' }) as any,
         );

         await expect(workoutLogService.findById('user-1', 'log-1')).rejects.toThrow('Forbidden');
      });
   });

   // ========== create ==========
   describe('create', () => {
      const validInput = {
         exercises: [
            { exerciseId: 'ex-1', order: 0, sets: [{ setNumber: 1, reps: 10, weight: 60 }] },
         ],
      };

      it('should create a workout log without workoutPlanId', async () => {
         const log = createMockWorkoutLog();
         mockLogRepo.create.mockResolvedValue(log as any);
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         const result = await workoutLogService.create('user-1', validInput as any);

         expect(result).toEqual(log);
         expect(mockPlanRepo.findById).not.toHaveBeenCalled();
      });

      it('should validate workoutPlanId belongs to user', async () => {
         const plan = createMockWorkoutPlan({ userId: 'user-1' });
         mockPlanRepo.findById.mockResolvedValue(plan as any);
         mockLogRepo.create.mockResolvedValue(createMockWorkoutLog() as any);
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await expect(
            workoutLogService.create('user-1', { ...validInput, workoutPlanId: 'plan-1' } as any),
         ).resolves.toBeDefined();
      });

      it('should throw NotFoundError when workoutPlanId does not exist', async () => {
         mockPlanRepo.findById.mockResolvedValue(null);

         await expect(
            workoutLogService.create('user-1', { ...validInput, workoutPlanId: 'missing' } as any),
         ).rejects.toThrow('Workout plan not found');
      });

      it('should throw ForbiddenError when workoutPlanId belongs to another user', async () => {
         mockPlanRepo.findById.mockResolvedValue(
            createMockWorkoutPlan({ userId: 'other-user' }) as any,
         );

         await expect(
            workoutLogService.create('user-1', { ...validInput, workoutPlanId: 'plan-1' } as any),
         ).rejects.toThrow(/does not belong/);
      });

      it('should throw ForbiddenError when workout plan is archived', async () => {
         mockPlanRepo.findById.mockResolvedValue(
            createMockWorkoutPlan({ userId: 'user-1', isArchived: true }) as any,
         );

         await expect(
            workoutLogService.create('user-1', { ...validInput, workoutPlanId: 'plan-1' } as any),
         ).rejects.toThrow(/archived/);
      });

      it('should call checkAndUpdatePR for every set of every exercise', async () => {
         const inputMulti = {
            exercises: [
               { exerciseId: 'ex-1', order: 0, sets: [
                  { setNumber: 1, reps: 10, weight: 60 },
                  { setNumber: 2, reps: 8, weight: 70 },
               ]},
               { exerciseId: 'ex-2', order: 1, sets: [
                  { setNumber: 1, reps: 12, weight: 50 },
               ]},
            ],
         };
         mockLogRepo.create.mockResolvedValue(createMockWorkoutLog() as any);
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await workoutLogService.create('user-1', inputMulti as any);

         // 3 sets total → 3 PR checks
         expect(mockPRRepo.findByUserAndExercise).toHaveBeenCalledTimes(3);
      });

      it('should use data.date as PR date when provided', async () => {
         const inputWithDate = {
            ...validInput,
            date: '2024-06-15T10:00:00.000Z',
         };
         mockLogRepo.create.mockResolvedValue(createMockWorkoutLog() as any);
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await workoutLogService.create('user-1', inputWithDate as any);

         expect(mockPRRepo.upsert).toHaveBeenCalledWith(
            'user-1', 'ex-1', 60, 10,
            new Date('2024-06-15T10:00:00.000Z'),
         );
      });
   });

   // ========== update ==========
   describe('update', () => {
      it('should update log when it belongs to user', async () => {
         mockLogRepo.findById.mockResolvedValue(createMockWorkoutLog() as any);
         const updated = createMockWorkoutLog({ isComplete: true });
         mockLogRepo.update.mockResolvedValue(updated as any);

         const result = await workoutLogService.update('user-1', 'log-1', { isComplete: true });

         expect(result.isComplete).toBe(true);
      });

      it('should throw NotFoundError when log does not exist', async () => {
         mockLogRepo.findById.mockResolvedValue(null);

         await expect(
            workoutLogService.update('user-1', 'missing', { isComplete: true }),
         ).rejects.toThrow('Workout log not found');
      });

      it('should throw ForbiddenError when log belongs to another user', async () => {
         mockLogRepo.findById.mockResolvedValue(
            createMockWorkoutLog({ userId: 'other' }) as any,
         );

         await expect(
            workoutLogService.update('user-1', 'log-1', { isComplete: true }),
         ).rejects.toThrow('Forbidden');
      });
   });

   // ========== delete ==========
   describe('delete', () => {
      it('should delete log when it belongs to user', async () => {
         mockLogRepo.findById.mockResolvedValue(createMockWorkoutLog() as any);
         mockLogRepo.delete.mockResolvedValue(undefined as any);

         await expect(workoutLogService.delete('user-1', 'log-1')).resolves.not.toThrow();
      });

      it('should throw NotFoundError when log does not exist', async () => {
         mockLogRepo.findById.mockResolvedValue(null);

         await expect(workoutLogService.delete('user-1', 'missing')).rejects.toThrow('Workout log not found');
      });

      it('should throw ForbiddenError when log belongs to another user', async () => {
         mockLogRepo.findById.mockResolvedValue(
            createMockWorkoutLog({ userId: 'other' }) as any,
         );

         await expect(workoutLogService.delete('user-1', 'log-1')).rejects.toThrow('Forbidden');
      });
   });

   // ========== checkAndUpdatePR ==========
   describe('checkAndUpdatePR', () => {
      it('should do nothing when weight is 0', async () => {
         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 0, 10);

         expect(mockPRRepo.findByUserAndExercise).not.toHaveBeenCalled();
      });

      it('should do nothing when weight is negative', async () => {
         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', -5, 10);

         expect(mockPRRepo.findByUserAndExercise).not.toHaveBeenCalled();
      });

      it('should create a new PR when no current PR exists', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 100, 5);

         expect(mockPRRepo.upsert).toHaveBeenCalledWith('user-1', 'ex-1', 100, 5, expect.any(Date));
      });

      it('should update PR when new weight is higher', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 80, reps: 5 }) as any,
         );
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 100, 5);

         expect(mockPRRepo.upsert).toHaveBeenCalled();
      });

      it('should update PR when same weight but higher reps', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 100, 8);

         expect(mockPRRepo.upsert).toHaveBeenCalled();
      });

      it('should NOT update PR when weight is lower', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 80, 10);

         expect(mockPRRepo.upsert).not.toHaveBeenCalled();
      });

      it('should NOT update PR when same weight and equal reps', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 100, 5);

         expect(mockPRRepo.upsert).not.toHaveBeenCalled();
      });

      it('should NOT update PR when same weight and fewer reps', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 100, 3);

         expect(mockPRRepo.upsert).not.toHaveBeenCalled();
      });

      it('should use provided date parameter', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);
         const specificDate = new Date('2024-03-15');

         await workoutLogService.checkAndUpdatePR('user-1', 'ex-1', 100, 5, specificDate);

         expect(mockPRRepo.upsert).toHaveBeenCalledWith('user-1', 'ex-1', 100, 5, specificDate);
      });
   });
});
