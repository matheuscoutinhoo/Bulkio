import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { createResponse } from '../models/types';
import { asyncHandler } from '../utils/asyncHandler';

export const dashboardController = {
   getStats: asyncHandler(async (req: Request, res: Response) => {
      const stats = await dashboardService.getStats(req.user!.userId);
      res.json(createResponse(stats));
   }),

   getExerciseProgression: asyncHandler(async (req: Request, res: Response) => {
      const progression = await dashboardService.getExerciseProgression(
         req.user!.userId,
         req.params.exerciseId as string,
      );
      res.json(createResponse(progression));
   }),
};
