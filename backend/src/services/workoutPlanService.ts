import { workoutPlanRepository } from '../repositories/workoutPlanRepository';
import { CreateWorkoutPlanInput, UpdateWorkoutPlanInput } from '../models/schemas';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const workoutPlanService = {
   async findAll(userId: string, includeArchived: boolean, page: number, limit: number) {
      const [plans, total] = await workoutPlanRepository.findAllByUser(userId, includeArchived, page, limit);
      return {
         plans,
         total,
         page,
         totalPages: Math.ceil(total / limit),
      };
   },

   async findById(userId: string, id: string) {
      const plan = await workoutPlanRepository.findById(id);
      if (!plan) throw new NotFoundError('Workout plan');
      if (plan.userId !== userId) throw new ForbiddenError();
      return plan;
   },

   async create(userId: string, data: CreateWorkoutPlanInput) {
      return workoutPlanRepository.create(userId, data);
   },

   async update(userId: string, id: string, data: UpdateWorkoutPlanInput) {
      const plan = await workoutPlanRepository.findById(id);
      if (!plan) throw new NotFoundError('Workout plan');
      if (plan.userId !== userId) throw new ForbiddenError();
      return workoutPlanRepository.update(id, data);
   },

   async duplicate(userId: string, id: string) {
      const plan = await workoutPlanRepository.findById(id);
      if (!plan) throw new NotFoundError('Workout plan');
      if (plan.userId !== userId) throw new ForbiddenError();
      return workoutPlanRepository.duplicate(id, userId);
   },

   async archive(userId: string, id: string) {
      const plan = await workoutPlanRepository.findById(id);
      if (!plan) throw new NotFoundError('Workout plan');
      if (plan.userId !== userId) throw new ForbiddenError();
      return workoutPlanRepository.delete(id);
   },
};
