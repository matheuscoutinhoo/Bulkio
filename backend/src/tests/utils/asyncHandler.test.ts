import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../utils/asyncHandler';
import { mockRequest, mockResponse, mockNext } from '../helpers';

describe('asyncHandler', () => {
   it('should call the handler function with req, res, next', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(handler);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await wrapped(req, res, next);

      expect(handler).toHaveBeenCalledWith(req, res, next);
   });

   it('should call next with error when handler throws', async () => {
      const error = new Error('Something went wrong');
      const handler = vi.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(handler);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
   });

   it('should not call next when handler succeeds', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(handler);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext();

      await wrapped(req, res, next);

      expect(next).not.toHaveBeenCalled();
   });
});
