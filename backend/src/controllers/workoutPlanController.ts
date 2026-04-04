import { Request, Response, NextFunction } from 'express';
import { workoutPlanService } from '../services/workoutPlanService';
import { createResponse, createPaginatedResponse } from '../models/types';

export const workoutPlanController = {
   async findAll(req: Request, res: Response, next: NextFunction) {
      try {
         const { page = 1, limit = 20, includeArchived = 'false' } = req.query;
         const result = await workoutPlanService.findAll(
            req.user!.userId,
            includeArchived === 'true',
            Number(page),
            Number(limit),
         );
         res.json(createPaginatedResponse(result.plans, {
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
         const plan = await workoutPlanService.findById(req.user!.userId, req.params.id as string);
         res.json(createResponse(plan));
      } catch (error) {
         next(error);
      }
   },

   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const plan = await workoutPlanService.create(req.user!.userId, req.body);
         res.status(201).json(createResponse(plan, 'Workout plan created'));
      } catch (error) {
         next(error);
      }
   },

   async update(req: Request, res: Response, next: NextFunction) {
      try {
         const plan = await workoutPlanService.update(req.user!.userId, req.params.id as string, req.body);
         res.json(createResponse(plan, 'Workout plan updated'));
      } catch (error) {
         next(error);
      }
   },

   async duplicate(req: Request, res: Response, next: NextFunction) {
      try {
         const plan = await workoutPlanService.duplicate(req.user!.userId, req.params.id as string);
         res.status(201).json(createResponse(plan, 'Workout plan duplicated'));
      } catch (error) {
         next(error);
      }
   },

   async archive(req: Request, res: Response, next: NextFunction) {
      try {
         await workoutPlanService.archive(req.user!.userId, req.params.id as string);
         res.json(createResponse(null, 'Workout plan archived'));
      } catch (error) {
         next(error);
      }
   },
};
