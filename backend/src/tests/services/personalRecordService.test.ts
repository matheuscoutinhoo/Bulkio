import { describe, it, expect, vi, beforeEach } from 'vitest';
import { personalRecordService } from '../../services/personalRecordService';
import { createMockPR } from '../helpers';

vi.mock('../../repositories/personalRecordRepository', () => ({
   personalRecordRepository: {
      findByUserAndExercise: vi.fn(),
      upsert: vi.fn(),
   },
}));

import { personalRecordRepository } from '../../repositories/personalRecordRepository';

const mockPRRepo = vi.mocked(personalRecordRepository);

describe('personalRecordService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   describe('checkAndUpdate', () => {
      it('should do nothing when weight is 0', async () => {
         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 0, 10);

         expect(mockPRRepo.findByUserAndExercise).not.toHaveBeenCalled();
      });

      it('should do nothing when weight is negative', async () => {
         await personalRecordService.checkAndUpdate('user-1', 'ex-1', -5, 10);

         expect(mockPRRepo.findByUserAndExercise).not.toHaveBeenCalled();
      });

      it('should create a new PR when no current PR exists', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 100, 5);

         expect(mockPRRepo.upsert).toHaveBeenCalledWith('user-1', 'ex-1', 100, 5, expect.any(Date));
      });

      it('should update PR when new weight is higher', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 80, reps: 5 }) as any,
         );
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 100, 5);

         expect(mockPRRepo.upsert).toHaveBeenCalled();
      });

      it('should update PR when same weight but higher reps', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );
         mockPRRepo.upsert.mockResolvedValue(undefined as any);

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 100, 8);

         expect(mockPRRepo.upsert).toHaveBeenCalled();
      });

      it('should NOT update PR when weight is lower', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 80, 10);

         expect(mockPRRepo.upsert).not.toHaveBeenCalled();
      });

      it('should NOT update PR when same weight and equal reps', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 100, 5);

         expect(mockPRRepo.upsert).not.toHaveBeenCalled();
      });

      it('should NOT update PR when same weight and fewer reps', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(
            createMockPR({ weight: 100, reps: 5 }) as any,
         );

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 100, 3);

         expect(mockPRRepo.upsert).not.toHaveBeenCalled();
      });

      it('should use provided date parameter', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);
         const specificDate = new Date('2024-03-15');

         await personalRecordService.checkAndUpdate('user-1', 'ex-1', 100, 5, specificDate);

         expect(mockPRRepo.upsert).toHaveBeenCalledWith('user-1', 'ex-1', 100, 5, specificDate);
      });
   });

   describe('updateFromExercises', () => {
      it('should call checkAndUpdate for each set of each exercise', async () => {
         mockPRRepo.findByUserAndExercise.mockResolvedValue(null);
         mockPRRepo.upsert.mockResolvedValue(undefined as any);
         const logDate = new Date('2024-01-01');

         await personalRecordService.updateFromExercises('user-1', [
            { exerciseId: 'ex-1', sets: [{ weight: 50, reps: 10 }, { weight: 60, reps: 8 }] },
            { exerciseId: 'ex-2', sets: [{ weight: 100, reps: 5 }] },
         ], logDate);

         expect(mockPRRepo.findByUserAndExercise).toHaveBeenCalledTimes(3);
         expect(mockPRRepo.upsert).toHaveBeenCalledTimes(3);
      });
   });
});
