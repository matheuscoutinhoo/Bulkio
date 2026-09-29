import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { createResponse } from '../models/types';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const timeZoneSchema = z.string().max(100).refine((timeZone) => {
   try {
      new Intl.DateTimeFormat('en-US', { timeZone });
      return true;
   } catch {
      return false;
   }
}, 'Invalid time zone');

export const dashboardController = {
   getStats: asyncHandler(async (req: Request, res: Response) => {
      const timeZone = timeZoneSchema.parse(req.query.timeZone ?? 'UTC');
      const stats = await dashboardService.getStats(req.user!.userId, timeZone);
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
