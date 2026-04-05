import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middlewares/auth';
import { errorHandler, validate, validateQuery } from '../../middlewares/errorHandler';
import { UnauthorizedError, AppError, NotFoundError } from '../../utils/errors';
import { mockRequest, mockResponse, mockNext } from '../helpers';
import { z, ZodError } from 'zod';

describe('authenticate middleware', () => {
   const secret = process.env.JWT_SECRET || 'dev-fallback-secret';

   it('should call next() and attach user on valid Bearer token', () => {
      const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, secret, { expiresIn: '15m' });
      const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
      const next = mockNext();

      authenticate(req, mockResponse(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('u1');
      expect(req.user.email).toBe('a@b.com');
   });

   it('should call next(UnauthorizedError) when Authorization header is missing', () => {
      const req = mockRequest({ headers: {} });
      const next = mockNext();

      authenticate(req, mockResponse(), next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0] as Error;
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid or expired token');
   });

   it('should call next(UnauthorizedError) when header does not start with Bearer', () => {
      const req = mockRequest({ headers: { authorization: 'Basic abc123' } });
      const next = mockNext();

      authenticate(req, mockResponse(), next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0] as Error;
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid or expired token');
   });

   it('should call next(UnauthorizedError) when token is malformed', () => {
      const req = mockRequest({ headers: { authorization: 'Bearer invalid.token.here' } });
      const next = mockNext();

      authenticate(req, mockResponse(), next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0] as Error;
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid or expired token');
   });

   it('should call next(UnauthorizedError) when token is signed with wrong secret', () => {
      const token = jwt.sign({ userId: 'u1', email: 'a@b.com' }, 'wrong-secret');
      const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });
      const next = mockNext();

      authenticate(req, mockResponse(), next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0] as Error;
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid or expired token');
   });
});

describe('errorHandler middleware', () => {
   it('should return 400 with field errors for ZodError', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      let zodErr: ZodError;
      try {
         schema.parse({ name: 123, age: 'abc' });
      } catch (e) {
         zodErr = e as ZodError;
      }

      const res = mockResponse();
      errorHandler(zodErr!, mockRequest(), res, mockNext());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            success: false,
            message: 'Validation failed',
         }),
      );
   });

   it('should return matching statusCode for AppError subclass', () => {
      const err = new NotFoundError('Exercise');
      const res = mockResponse();

      errorHandler(err, mockRequest(), res, mockNext());

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({ message: 'Exercise not found' }),
      );
   });

   it('should return 500 for unhandled errors', () => {
      const err = new Error('Something unexpected');
      const res = mockResponse();

      errorHandler(err, mockRequest(), res, mockNext());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({ message: 'Internal server error' }),
      );
   });
});

describe('validate middleware', () => {
   const schema = z.object({ name: z.string().min(1) });

   it('should set req.body to parsed result and call next() on valid body', () => {
      const req = mockRequest({ body: { name: 'Test', extraField: 'ignored' } });
      const next = mockNext();

      validate(schema)(req, mockResponse(), next);

      expect(req.body).toEqual({ name: 'Test' }); // extraField stripped
      expect(next).toHaveBeenCalledWith();
   });

   it('should call next(error) when body fails validation', () => {
      const req = mockRequest({ body: { name: '' } });
      const next = mockNext();

      validate(schema)(req, mockResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
   });
});

describe('validateQuery middleware', () => {
   const schema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      search: z.string().optional(),
   });

   it('should set req.query to parsed result and call next()', () => {
      const req = mockRequest({ query: { page: '2', search: 'test' } });
      const next = mockNext();

      validateQuery(schema)(req, mockResponse(), next);

      expect(req.query).toEqual({ page: 2, search: 'test' });
      expect(next).toHaveBeenCalledWith();
   });

   it('should call next(error) when query fails validation', () => {
      const req = mockRequest({ query: { page: '0' } }); // min(1) fails
      const next = mockNext();

      validateQuery(schema)(req, mockResponse(), next);

      expect(next).toHaveBeenCalledWith(expect.any(ZodError));
   });
});
