import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bodyWeightController } from '../../controllers/bodyWeightController';
import { mockRequest, mockResponse, mockNext, createMockBodyWeight } from '../helpers';

vi.mock('../../services/bodyWeightService', () => ({
   bodyWeightService: {
      findAll: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
   },
}));

import { bodyWeightService } from '../../services/bodyWeightService';

const mockService = vi.mocked(bodyWeightService);

describe('bodyWeightController', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== findAll ==========
   describe('findAll', () => {
      it('should return paginated body weight records', async () => {
         const records = [createMockBodyWeight()];
         mockService.findAll.mockResolvedValue({
            records,
            total: 1,
            page: 1,
            totalPages: 1,
         });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: { page: '1', limit: '50' },
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1', 1, 50);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: records,
               pagination: expect.objectContaining({ page: 1, total: 1 }),
            }),
         );
      });

      it('should use default page and limit when not provided', async () => {
         mockService.findAll.mockResolvedValue({
            records: [],
            total: 0,
            page: 1,
            totalPages: 0,
         });

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.findAll(req, res, next);

         expect(mockService.findAll).toHaveBeenCalledWith('user-1', 1, 50);
      });

      it('should call next(error) when service throws', async () => {
         mockService.findAll.mockRejectedValue(new Error('DB error'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            query: {},
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.findAll(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
         expect(next.mock.calls[0][0]).toBeDefined();
      });
   });

   // ========== create ==========
   describe('create', () => {
      it('should return 201 with created record', async () => {
         const record = createMockBodyWeight();
         mockService.create.mockResolvedValue(record as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            body: { weight: 80.5 },
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.create(req, res, next);

         expect(mockService.create).toHaveBeenCalledWith('user-1', { weight: 80.5 });
         expect(res.status).toHaveBeenCalledWith(201);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: record,
               message: 'Weight recorded',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.create.mockRejectedValue(new Error('fail'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            body: { weight: 80 },
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.create(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== delete ==========
   describe('delete', () => {
      it('should return success message on delete', async () => {
         mockService.delete.mockResolvedValue(undefined as any);

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bw-1' },
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.delete(req, res, next);

         expect(mockService.delete).toHaveBeenCalledWith('user-1', 'bw-1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: null,
               message: 'Weight record deleted',
            }),
         );
      });

      it('should call next(error) when service throws', async () => {
         mockService.delete.mockRejectedValue(new Error('not found'));

         const req = mockRequest({
            user: { userId: 'user-1', email: 'a@b.com' },
            params: { id: 'bad-id' },
         });
         const res = mockResponse();
         const next = mockNext();

         await bodyWeightController.delete(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });
});
