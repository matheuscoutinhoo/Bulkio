import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardController } from '../../controllers/dashboardController';
import { mockRequest, mockResponse, mockNext } from '../helpers';

vi.mock('../../services/dashboardService', () => ({
   dashboardService: {
      getStats: vi.fn(),
      getExerciseProgression: vi.fn(),
   },
}));

import { dashboardService } from '../../services/dashboardService';

const mockService = vi.mocked(dashboardService);

describe('dashboardController', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== getStats ==========
   describe('getStats', () => {
      it('should return dashboard stats', async () => {
         const stats = {
            weeklyWorkouts: { current: 3, previous: 2 },
            streak: 5,
            totalVolume: 50000,
            muscleDistribution: { CHEST: 10 },
            bodyWeight: { history: [], current: null, goal: null, target: null, initial: null },
            personalRecords: [],
            yearlyActivity: {},
         };
         mockService.getStats.mockResolvedValue(stats as any);

         const req = mockRequest({ user: { userId: 'user-1', email: 'a@b.com' } });
         const res = mockResponse();
         const next = mockNext();

         await dashboardController.getStats(req, res, next);

         expect(mockService.getStats).toHaveBeenCalledWith('user-1', 'UTC');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: stats }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.getStats.mockRejectedValue(new Error('DB error'));

         const req = mockRequest({ user: { userId: 'user-1', email: 'a@b.com' } });
         const res = mockResponse();
         const next = mockNext();

         await dashboardController.getStats(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });

      it('should pass the requested time zone to the service', async () => {
         mockService.getStats.mockReset();
         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { timeZone: 'America/Sao_Paulo' },
         });
         const next = mockNext();

         await dashboardController.getStats(req, mockResponse(), next);

         expect(mockService.getStats).toHaveBeenCalledWith('user-1', 'America/Sao_Paulo');
         expect(next).not.toHaveBeenCalled();
      });

      it('should reject an invalid time zone', async () => {
         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { timeZone: 'invalid/zone' },
         });
         const next = mockNext();

         await dashboardController.getStats(req, mockResponse(), next);

         expect(mockService.getStats).not.toHaveBeenCalled();
         expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ZodError' }));
      });
   });

   // ========== getExerciseProgression ==========
   describe('getExerciseProgression', () => {
      it('should return exercise progression data', async () => {
         const progression = [
            { date: '2024-01-15', sets: [{ setNumber: 1, reps: 10, weight: 60 }], maxWeight: 60, totalVolume: 600 },
         ];
         mockService.getExerciseProgression.mockResolvedValue(progression);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { exerciseId: 'ex-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await dashboardController.getExerciseProgression(req, res, next);

         expect(mockService.getExerciseProgression).toHaveBeenCalledWith('user-1', 'ex-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: progression }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.getExerciseProgression.mockRejectedValue(new Error('fail'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { exerciseId: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await dashboardController.getExerciseProgression(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });
});
