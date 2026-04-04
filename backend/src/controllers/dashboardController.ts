import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { createResponse } from '../models/types';

export const dashboardController = {
   async getStats(req: Request, res: Response, next: NextFunction) {
      try {
         const stats = await dashboardService.getStats(req.user!.userId);
         res.json(createResponse(stats));
      } catch (error) {
         next(error);
      }
   },

   async getExerciseProgression(req: Request, res: Response, next: NextFunction) {
      try {
         const progression = await dashboardService.getExerciseProgression(
            req.user!.userId,
            req.params.exerciseId as string,
         );
         res.json(createResponse(progression));
      } catch (error) {
         next(error);
      }
   },
};
