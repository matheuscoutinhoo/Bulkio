import { Request, Response, NextFunction } from 'express';
import { bodyWeightService } from '../services/bodyWeightService';
import { createResponse, createPaginatedResponse } from '../models/types';

export const bodyWeightController = {
   async findAll(req: Request, res: Response, next: NextFunction) {
      try {
         const { page = 1, limit = 50 } = req.query;
         const result = await bodyWeightService.findAll(req.user!.userId, Number(page), Number(limit));
         res.json(createPaginatedResponse(result.records, {
            page: result.page,
            limit: Number(limit),
            total: result.total,
            totalPages: result.totalPages,
         }));
      } catch (error) {
         next(error);
      }
   },

   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const record = await bodyWeightService.create(req.user!.userId, req.body);
         res.status(201).json(createResponse(record, 'Weight recorded'));
      } catch (error) {
         next(error);
      }
   },

   async delete(req: Request, res: Response, next: NextFunction) {
      try {
         await bodyWeightService.delete(req.user!.userId, req.params.id as string);
         res.json(createResponse(null, 'Weight record deleted'));
      } catch (error) {
         next(error);
      }
   },
};
