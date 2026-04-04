import { workoutLogRepository } from '../repositories/workoutLogRepository';
import { personalRecordRepository } from '../repositories/personalRecordRepository';
import { CreateWorkoutLogInput, UpdateWorkoutLogInput } from '../models/schemas';
import { NotFoundError, ForbiddenError } from '../utils/errors';

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
      const log = await workoutLogRepository.findById(id);
      if (!log) throw new NotFoundError('Workout log');
      if (log.userId !== userId) throw new ForbiddenError();
      return log;
   },

   async create(userId: string, data: CreateWorkoutLogInput) {
      // Validate workoutPlanId belongs to user and is not archived
      if (data.workoutPlanId) {
         const { workoutPlanRepository } = await import('../repositories/workoutPlanRepository');
         const plan = await workoutPlanRepository.findById(data.workoutPlanId);
         if (!plan) throw new NotFoundError('Workout plan');
         if (plan.userId !== userId) throw new ForbiddenError('Workout plan does not belong to user');
         if (plan.isArchived) throw new ForbiddenError('Cannot log from an archived workout plan');
      }

      const log = await workoutLogRepository.create(userId, data);

      // Check and update personal records using the workout log's date
      const logDate = data.date ? new Date(data.date) : new Date();
      for (const exercise of data.exercises) {
         for (const set of exercise.sets) {
            await this.checkAndUpdatePR(userId, exercise.exerciseId, set.weight, set.reps, logDate);
         }
      }

      return log;
   },

   async update(userId: string, id: string, data: UpdateWorkoutLogInput) {
      const log = await workoutLogRepository.findById(id);
      if (!log) throw new NotFoundError('Workout log');
      if (log.userId !== userId) throw new ForbiddenError();
      return workoutLogRepository.update(id, data);
   },

   async delete(userId: string, id: string) {
      const log = await workoutLogRepository.findById(id);
      if (!log) throw new NotFoundError('Workout log');
      if (log.userId !== userId) throw new ForbiddenError();
      return workoutLogRepository.delete(id);
   },

   async checkAndUpdatePR(userId: string, exerciseId: string, weight: number, reps: number, date?: Date) {
      if (weight <= 0) return;

      const currentPR = await personalRecordRepository.findByUserAndExercise(userId, exerciseId);

      // Update PR if new weight is higher, or same weight with more reps
      if (!currentPR || weight > currentPR.weight || (weight === currentPR.weight && reps > currentPR.reps)) {
         await personalRecordRepository.upsert(userId, exerciseId, weight, reps, date ?? new Date());
      }
   },
};
