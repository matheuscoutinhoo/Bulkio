import { workoutLogRepository } from '../repositories/workoutLogRepository';
import { workoutPlanRepository } from '../repositories/workoutPlanRepository';
import { personalRecordService } from './personalRecordService';
import { CreateWorkoutLogInput, UpdateWorkoutLogInput } from '../models/schemas';
import { NotFoundError, ForbiddenError } from '../utils/errors';

async function assertLogOwnership(userId: string, logId: string) {
   const log = await workoutLogRepository.findById(logId);
   if (!log) throw new NotFoundError('Workout log');
   if (log.userId !== userId) throw new ForbiddenError();
   return log;
}

export const workoutLogService = {
   async findAll(userId: string, filters: {
      page: number;
      limit: number;
      startDate?: string;
      endDate?: string;
      exerciseId?: string;
      muscleGroup?: string;
      workoutPlanId?: string;
   }) {
      const [logs, total] = await workoutLogRepository.findAllByUser(userId, filters);
      return {
         logs,
         total,
         page: filters.page,
         totalPages: Math.ceil(total / filters.limit),
      };
   },

   async findById(userId: string, id: string) {
      return assertLogOwnership(userId, id);
   },

   async create(userId: string, data: CreateWorkoutLogInput) {
      if (data.workoutPlanId) {
         const plan = await workoutPlanRepository.findById(data.workoutPlanId);
         if (!plan) throw new NotFoundError('Workout plan');
         if (plan.userId !== userId) throw new ForbiddenError('Workout plan does not belong to user');
         if (plan.isArchived) throw new ForbiddenError('Cannot log from an archived workout plan');
      }

      const log = await workoutLogRepository.create(userId, data);

      if (data.isComplete !== false && data.exercises.length > 0) {
         const logDate = data.date ? new Date(data.date) : new Date();
         await personalRecordService.updateFromExercises(userId, data.exercises, logDate);
      }

      return log;
   },

   async update(userId: string, id: string, data: UpdateWorkoutLogInput) {
      await assertLogOwnership(userId, id);
      const log = await workoutLogRepository.update(id, data);

      if (log.isComplete && (data.exercises || data.isComplete === true)) {
         const logDate = new Date(log.date);
         const exercises = (data.exercises ?? log.exercises).map((exercise) => ({
            exerciseId: 'exerciseId' in exercise ? exercise.exerciseId : exercise.exercise.id,
            sets: exercise.sets,
         }));
         await personalRecordService.updateFromExercises(userId, exercises, logDate);
      }

      return log;
   },

   async delete(userId: string, id: string) {
      await assertLogOwnership(userId, id);
      return workoutLogRepository.delete(id);
   },
};
