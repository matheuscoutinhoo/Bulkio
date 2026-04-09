import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workoutPlanController } from '../../controllers/workoutPlanController';
import { mockRequest, mockResponse, mockNext, createMockWorkoutPlan } from '../helpers';

vi.mock('../../services/workoutPlanService', () => ({
   workoutPlanService: {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      duplicate: vi.fn(),
      archive: vi.fn(),
   },
}));

import { workoutPlanService } from '../../services/workoutPlanService';

const mockService = vi.mocked(workoutPlanService);

describe('workoutPlanController', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated workout plans', async () => {
         const plans = [createMockWorkoutPlan()];
         mockService.findAll.mockResolvedValue({
            plans,
            total: 1,
            page: 1,
            totalPages: 1,
         });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { page: '1', limit: '20', includeArchived: 'false' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1', false, 1, 20);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: plans,
               pagination: expect.objectContaining({ page: 1, total: 1 }),
            }),
         );
      });

      it('should pass includeArchived=true to service', async () => {
         mockService.findAll.mockResolvedValue({ plans: [], total: 0, page: 1, totalPages: 0 });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { includeArchived: 'true' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1', true, 1, 20);
      });

      it('should default includeArchived to false', async () => {
         mockService.findAll.mockResolvedValue({ plans: [], total: 0, page: 1, totalPages: 0 });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1', false, 1, 20);
      });

      it('should call next(error) when service throws', async () => {
         mockService.findAll.mockRejectedValue(new Error('DB error'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.findAll(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return workout plan by id', async () => {
         const plan = createMockWorkoutPlan();
         mockService.findById.mockResolvedValue(plan as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'plan-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.findById(req, res, next);

         expect(mockService.findById).toHaveBeenCalledWith('user-1', 'plan-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: plan }),
         );
      });

      it('should call next(error) when plan not found', async () => {
         mockService.findById.mockRejectedValue(new Error('Not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.findById(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== create ==========
   describe('create', () => {
      it('should return 201 with created plan', async () => {
         const plan = createMockWorkoutPlan();
         mockService.create.mockResolvedValue(plan as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            body: { name: 'Push Day' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.create(req, res, next);

         expect(mockService.create).toHaveBeenCalledWith('user-1', { name: 'Push Day' });
         expect(res.status).toHaveBeenCalledWith(201);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: plan,
               message: 'Workout plan created',
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

         await workoutPlanController.create(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== update ==========
   describe('update', () => {
      it('should return updated plan', async () => {
         const plan = createMockWorkoutPlan({ name: 'Updated' });
         mockService.update.mockResolvedValue(plan as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'plan-1' },
            body: { name: 'Updated' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.update(req, res, next);

         expect(mockService.update).toHaveBeenCalledWith('user-1', 'plan-1', { name: 'Updated' });
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: plan,
               message: 'Workout plan updated',
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

         await workoutPlanController.update(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== duplicate ==========
   describe('duplicate', () => {
      it('should return 201 with duplicated plan', async () => {
         const plan = createMockWorkoutPlan({ id: 'plan-2', name: 'Push Day (copy)' });
         mockService.duplicate.mockResolvedValue(plan as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'plan-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.duplicate(req, res, next);

         expect(mockService.duplicate).toHaveBeenCalledWith('user-1', 'plan-1');
         expect(res.status).toHaveBeenCalledWith(201);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: plan,
               message: 'Workout plan duplicated',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.duplicate.mockRejectedValue(new Error('not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.duplicate(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== archive ==========
   describe('archive', () => {
      it('should return success message on archive', async () => {
         mockService.archive.mockResolvedValue(undefined as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'plan-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.archive(req, res, next);

         expect(mockService.archive).toHaveBeenCalledWith('user-1', 'plan-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: null,
               message: 'Workout plan archived',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.archive.mockRejectedValue(new Error('not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await workoutPlanController.archive(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });
});
