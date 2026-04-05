import { describe, it, expect } from 'vitest';
import {
   AppError,
   NotFoundError,
   UnauthorizedError,
   ForbiddenError,
   ConflictError,
   ValidationError,
} from '../../utils/errors';

describe('Custom Errors', () => {
   describe('AppError', () => {
      it('should set message and statusCode', () => {
         const err = new AppError('test error', 418);
         expect(err.message).toBe('test error');
         expect(err.statusCode).toBe(418);
         expect(err.isOperational).toBe(true);
      });

      it('should allow overriding isOperational to false', () => {
         const err = new AppError('fatal', 500, false);
         expect(err.isOperational).toBe(false);
      });

      it('should be an instance of Error', () => {
         expect(new AppError('x', 400)).toBeInstanceOf(Error);
      });
   });

   describe('NotFoundError', () => {
      it('should set statusCode 404 and formatted message', () => {
         const err = new NotFoundError('Exercise');
         expect(err.statusCode).toBe(404);
         expect(err.message).toBe('Exercise not found');
      });

      it('should be instanceof AppError', () => {
         expect(new NotFoundError('X')).toBeInstanceOf(AppError);
      });
   });

   describe('UnauthorizedError', () => {
      it('should default to statusCode 401 and "Unauthorized" message', () => {
         const err = new UnauthorizedError();
         expect(err.statusCode).toBe(401);
         expect(err.message).toBe('Unauthorized');
      });

      it('should accept a custom message', () => {
         const err = new UnauthorizedError('Custom msg');
         expect(err.message).toBe('Custom msg');
      });
   });

   describe('ForbiddenError', () => {
      it('should default to statusCode 403 and "Forbidden" message', () => {
         const err = new ForbiddenError();
         expect(err.statusCode).toBe(403);
         expect(err.message).toBe('Forbidden');
      });

      it('should accept a custom message', () => {
         const err = new ForbiddenError('Not allowed');
         expect(err.message).toBe('Not allowed');
      });
   });

   describe('ConflictError', () => {
      it('should set statusCode 409', () => {
         const err = new ConflictError('Duplicate');
         expect(err.statusCode).toBe(409);
         expect(err.message).toBe('Duplicate');
      });
   });

   describe('ValidationError', () => {
      it('should set statusCode 400', () => {
         const err = new ValidationError('Bad input');
         expect(err.statusCode).toBe(400);
         expect(err.message).toBe('Bad input');
      });
   });

   it('all subclasses should be instanceof AppError and Error', () => {
      const errors = [
         new NotFoundError('X'),
         new UnauthorizedError(),
         new ForbiddenError(),
         new ConflictError('X'),
         new ValidationError('X'),
      ];
      for (const err of errors) {
         expect(err).toBeInstanceOf(AppError);
         expect(err).toBeInstanceOf(Error);
      }
   });
});
