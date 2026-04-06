import { Request, Response } from 'express';
import { bodyWeightService } from '../services/bodyWeightService';
import { createResponse, createPaginatedResponse } from '../models/types';
import { asyncHandler } from '../utils/asyncHandler';

export const bodyWeightController = {
   findAll: asyncHandler(async (req: Request, res: Response) => {
      const { page = 1, limit = 50 } = req.query;
      const result = await bodyWeightService.findAll(req.user!.userId, Number(page), Number(limit));
      res.json(createPaginatedResponse(result.records, {
         page: result.page,
         limit: Number(limit),
         total: result.total,
         totalPages: result.totalPages,
      }));
   }),

   create: asyncHandler(async (req: Request, res: Response) => {
      const record = await bodyWeightService.create(req.user!.userId, req.body);
      res.status(201).json(createResponse(record, 'Weight recorded'));
   }),

   delete: asyncHandler(async (req: Request, res: Response) => {
      await bodyWeightService.delete(req.user!.userId, req.params.id as string);
      res.json(createResponse(null, 'Weight record deleted'));
   }),
};
