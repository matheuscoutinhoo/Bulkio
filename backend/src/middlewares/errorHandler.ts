import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../utils/errors';
import { createErrorResponse } from '../models/types';
import { logger } from '../config/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
   if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
         field: e.path.join('.'),
         message: e.message,
      }));
      res.status(400).json(createErrorResponse('Validation failed', errors));
      return;
   }

   if (err instanceof AppError) {
      res.status(err.statusCode).json(createErrorResponse(err.message));
      return;
   }

   logger.error(err, 'Unhandled error');
   res.status(500).json(createErrorResponse('Internal server error'));
}

export function validate(schema: ZodSchema) {
   return (req: Request, _res: Response, next: NextFunction) => {
      try {
         req.body = schema.parse(req.body);
         next();
      } catch (error) {
         next(error);
      }
   };
}

export function validateQuery(schema: ZodSchema) {
   return (req: Request, _res: Response, next: NextFunction) => {
      try {
         req.query = schema.parse(req.query) as any;
         next();
      } catch (error) {
         next(error);
      }
   };
}
