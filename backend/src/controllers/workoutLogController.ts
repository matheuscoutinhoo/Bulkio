import { Request, Response, NextFunction } from 'express';
import { workoutLogService } from '../services/workoutLogService';
import { createResponse, createPaginatedResponse } from '../models/types';

export const workoutLogController = {
   async findAll(req: Request, res: Response, next: NextFunction) {
      try {
         const {
            page = 1, limit = 20, startDate, endDate,
            exerciseId, muscleGroup, workoutPlanId,
         } = req.query;
         const result = await workoutLogService.findAll(req.user!.userId, {
            page: Number(page),
            limit: Number(limit),
            startDate: startDate as string | undefined,
            endDate: endDate as string | undefined,
            exerciseId: exerciseId as string | undefined,
            muscleGroup: muscleGroup as string | undefined,
            workoutPlanId: workoutPlanId as string | undefined,
         });
         res.json(createPaginatedResponse(result.logs, {
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
         const log = await workoutLogService.findById(req.user!.userId, req.params.id as string);
         res.json(createResponse(log));
      } catch (error) {
         next(error);
      }
   },

   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const log = await workoutLogService.create(req.user!.userId, req.body);
         res.status(201).json(createResponse(log, 'Workout logged'));
      } catch (error) {
         next(error);
      }
   },

   async update(req: Request, res: Response, next: NextFunction) {
      try {
         const log = await workoutLogService.update(req.user!.userId, req.params.id as string, req.body);
         res.json(createResponse(log, 'Workout log updated'));
      } catch (error) {
         next(error);
      }
   },

   async delete(req: Request, res: Response, next: NextFunction) {
      try {
         await workoutLogService.delete(req.user!.userId, req.params.id as string);
         res.json(createResponse(null, 'Workout log deleted'));
      } catch (error) {
         next(error);
      }
   },
};
