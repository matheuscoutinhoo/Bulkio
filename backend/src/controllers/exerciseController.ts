import { Request, Response, NextFunction } from 'express';
import { exerciseService } from '../services/exerciseService';
import { createResponse, createPaginatedResponse } from '../models/types';

export const exerciseController = {
   async findAll(req: Request, res: Response, next: NextFunction) {
      try {
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
      } catch (error) {
         next(error);
      }
   },

   async findById(req: Request, res: Response, next: NextFunction) {
      try {
         const exercise = await exerciseService.findById(req.params.id as string);
         res.json(createResponse(exercise));
      } catch (error) {
         next(error);
      }
   },

   async getMuscleGroups(req: Request, res: Response, next: NextFunction) {
      try {
         const groups = await exerciseService.getMuscleGroups();
         res.json(createResponse(groups));
      } catch (error) {
         next(error);
      }
   },
};
