import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workoutLogController } from '../../controllers/workoutLogController';
import { mockRequest, mockResponse, mockNext, createMockWorkoutLog } from '../helpers';

vi.mock('../../services/workoutLogService', () => ({
   workoutLogService: {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
   },
}));

import { workoutLogService } from '../../services/workoutLogService';

const mockService = vi.mocked(workoutLogService);

describe('workoutLogController', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated workout logs', async () => {
         const logs = [createMockWorkoutLog()];
         mockService.findAll.mockResolvedValue({
            logs,
            total: 1,
            page: 1,
            totalPages: 1,
         });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { page: '1', limit: '20' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1', {
            page: 1,
            limit: 20,
            startDate: undefined,
            endDate: undefined,
            exerciseId: undefined,
            muscleGroup: undefined,
            workoutPlanId: undefined,
         });
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: logs,
               pagination: expect.objectContaining({ page: 1, total: 1 }),
            }),
         );
      });

      it('should pass all query filters to service', async () => {
         mockService.findAll.mockResolvedValue({ logs: [], total: 0, page: 1, totalPages: 0 });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: {
               startDate: '2024-01-01',
               endDate: '2024-12-31',
               exerciseId: 'ex-1',
               muscleGroup: 'CHEST',
               workoutPlanId: 'plan-1',
            },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1',
            expect.objectContaining({
               startDate: '2024-01-01',
               endDate: '2024-12-31',
               exerciseId: 'ex-1',
               muscleGroup: 'CHEST',
               workoutPlanId: 'plan-1',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.findAll.mockRejectedValue(new Error('DB error'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.findAll(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return workout log by id', async () => {
         const log = createMockWorkoutLog();
         mockService.findById.mockResolvedValue(log as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'log-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.findById(req, res, next);

         expect(mockService.findById).toHaveBeenCalledWith('user-1', 'log-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: log }),
         );
      });

      it('should call next(error) when log not found', async () => {
         mockService.findById.mockRejectedValue(new Error('Not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.findById(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== create ==========
   describe('create', () => {
      it('should return 201 with created log', async () => {
         const log = createMockWorkoutLog();
         mockService.create.mockResolvedValue(log as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            body: { exercises: [] },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.create(req, res, next);

         expect(mockService.create).toHaveBeenCalledWith('user-1', { exercises: [] });
         expect(res.status).toHaveBeenCalledWith(201);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: log,
               message: 'Workout logged',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.create.mockRejectedValue(new Error('fail'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            body: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.create(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== update ==========
   describe('update', () => {
      it('should return updated log', async () => {
         const log = createMockWorkoutLog({ notes: 'updated' });
         mockService.update.mockResolvedValue(log as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'log-1' },
            body: { notes: 'updated' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.update(req, res, next);

         expect(mockService.update).toHaveBeenCalledWith('user-1', 'log-1', { notes: 'updated' });
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: log,
               message: 'Workout log updated',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.update.mockRejectedValue(new Error('not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
            body: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.update(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== delete ==========
   describe('delete', () => {
      it('should return success message on delete', async () => {
         mockService.delete.mockResolvedValue(undefined as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'log-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.delete(req, res, next);

         expect(mockService.delete).toHaveBeenCalledWith('user-1', 'log-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: null,
               message: 'Workout log deleted',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.delete.mockRejectedValue(new Error('fail'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutLogController.delete(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });
});
