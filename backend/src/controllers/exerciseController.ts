import { Request, Response } from 'express';
import { exerciseService } from '../services/exerciseService';
import { createResponse, createPaginatedResponse } from '../models/types';
import { asyncHandler } from '../utils/asyncHandler';

export const exerciseController = {
   findAll: asyncHandler(async (req: Request, res: Response) => {
      const { page = 1, limit = 20, muscleGroup, type, equipment, search } = req.query;
      const result = await exerciseService.findAll({
         page: Number(page),
         limit: Number(limit),
         muscleGroup: muscleGroup as string | undefined,
         type: type as string | undefined,
         equipment: equipment as string | undefined,
         search: search as string | undefined,
      });
      res.json(createPaginatedResponse(result.exercises, {
         page: result.page,
         limit: Number(limit),
         total: result.total,
         totalPages: result.totalPages,
      }));
   }),

   findById: asyncHandler(async (req: Request, res: Response) => {
      const exercise = await exerciseService.findById(req.params.id as string);
      res.json(createResponse(exercise));
   }),

   getMuscleGroups: asyncHandler(async (req: Request, res: Response) => {
      const groups = await exerciseService.getMuscleGroups();
      res.json(createResponse(groups));
   }),
};
