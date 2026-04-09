import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exerciseController } from '../../controllers/exerciseController';
import { mockRequest, mockResponse, mockNext, createMockExercise } from '../helpers';

vi.mock('../../services/exerciseService', () => ({
   exerciseService: {
      findAll: vi.fn(),
      findById: vi.fn(),
      getMuscleGroups: vi.fn(),
   },
}));

import { exerciseService } from '../../services/exerciseService';

const mockService = vi.mocked(exerciseService);

describe('exerciseController', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated exercises', async () => {
         const exercises = [createMockExercise()];
         mockService.findAll.mockResolvedValue({
            exercises,
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

         await exerciseController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith({
            page: 1,
            limit: 20,
            muscleGroup: undefined,
            type: undefined,
            equipment: undefined,
            search: undefined,
         });
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: exercises,
               pagination: expect.objectContaining({ page: 1, total: 1 }),
            }),
         );
      });

      it('should pass query filters to service', async () => {
         mockService.findAll.mockResolvedValue({
            exercises: [],
            total: 0,
            page: 1,
            totalPages: 0,
         });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL', search: 'bench' },
         });
         const res = mockResponse();
         const next = mockNext();

         await exerciseController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
               muscleGroup: 'CHEST',
               type: 'COMPOUND',
               equipment: 'BARBELL',
               search: 'bench',
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

         await exerciseController.findAll(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== findById ==========
   describe('findById', () => {
      it('should return exercise by id', async () => {
         const exercise = createMockExercise();
         mockService.findById.mockResolvedValue(exercise as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'exercise-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await exerciseController.findById(req, res, next);

         expect(mockService.findById).toHaveBeenCalledWith('exercise-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: exercise }),
         );
      });

      it('should call next(error) when exercise not found', async () => {
         mockService.findById.mockRejectedValue(new Error('Not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await exerciseController.findById(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== getMuscleGroups ==========
   describe('getMuscleGroups', () => {
      it('should return muscle groups list', async () => {
         const groups = ['CHEST', 'BACK', 'LEGS'];
         mockService.getMuscleGroups.mockResolvedValue(groups as any);

         const req = mockRequest({ user: { userId: 'user-1', email: 'a@b.com' } });
         const res = mockResponse();
         const next = mockNext();

         await exerciseController.getMuscleGroups(req, res, next);

         expect(mockService.getMuscleGroups).toHaveBeenCalled();
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: groups }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.getMuscleGroups.mockRejectedValue(new Error('fail'));

         const req = mockRequest({ user: { userId: 'user-1', email: 'a@b.com' } });
         const res = mockResponse();
         const next = mockNext();

         await exerciseController.getMuscleGroups(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });
});
