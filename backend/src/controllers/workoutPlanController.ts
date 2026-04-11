import { Request, Response } from 'express';
import { workoutPlanService } from '../services/workoutPlanService';
import { aiWorkoutService } from '../services/aiWorkoutService';
import { createResponse, createPaginatedResponse } from '../models/types';
import { asyncHandler } from '../utils/asyncHandler';

export const workoutPlanController = {
   findAll: asyncHandler(async (req: Request, res: Response) => {
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
   }),

   findById: asyncHandler(async (req: Request, res: Response) => {
      const plan = await workoutPlanService.findById(req.user!.userId, req.params.id as string);
      res.json(createResponse(plan));
   }),

   create: asyncHandler(async (req: Request, res: Response) => {
      const plan = await workoutPlanService.create(req.user!.userId, req.body);
      res.status(201).json(createResponse(plan, 'Workout plan created'));
   }),

   update: asyncHandler(async (req: Request, res: Response) => {
      const plan = await workoutPlanService.update(req.user!.userId, req.params.id as string, req.body);
      res.json(createResponse(plan, 'Workout plan updated'));
   }),

   duplicate: asyncHandler(async (req: Request, res: Response) => {
      const plan = await workoutPlanService.duplicate(req.user!.userId, req.params.id as string);
      res.status(201).json(createResponse(plan, 'Workout plan duplicated'));
   }),

   archive: asyncHandler(async (req: Request, res: Response) => {
      await workoutPlanService.archive(req.user!.userId, req.params.id as string);
      res.json(createResponse(null, 'Workout plan archived'));
   }),

   generate: asyncHandler(async (req: Request, res: Response) => {
      const plan = await aiWorkoutService.generate(req.user!.userId, req.body);
      res.status(201).json(createResponse(plan, 'Workout plan generated'));
   }),
};
