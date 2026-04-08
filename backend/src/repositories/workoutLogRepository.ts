import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { CreateWorkoutLogInput, UpdateWorkoutLogInput } from '../models/schemas';

export const workoutLogRepository = {
   findAllByUser(
      userId: string,
      filters: {
         page: number;
         limit: number;
         startDate?: string;
         endDate?: string;
         exerciseId?: string;
         muscleGroup?: string;
         workoutPlanId?: string;
      },
   ) {
      const where: Prisma.WorkoutLogWhereInput = { userId };

      if (filters.startDate || filters.endDate) {
         where.date = {};
         if (filters.startDate) where.date.gte = new Date(filters.startDate);
         if (filters.endDate) where.date.lte = new Date(filters.endDate);
      }

      if (filters.workoutPlanId) where.workoutPlanId = filters.workoutPlanId;

      if (filters.exerciseId && filters.muscleGroup) {
         where.exercises = {
            some: {
               exerciseId: filters.exerciseId,
               exercise: { muscleGroup: filters.muscleGroup },
            },
         };
      } else if (filters.exerciseId) {
         where.exercises = { some: { exerciseId: filters.exerciseId } };
      } else if (filters.muscleGroup) {
         where.exercises = {
            some: { exercise: { muscleGroup: filters.muscleGroup } },
         };
      }

      return Promise.all([
         prisma.workoutLog.findMany({
            where,
            include: {
               workoutPlan: { select: { id: true, name: true } },
               exercises: {
                  include: {
                     exercise: true,
                     sets: { orderBy: { setNumber: 'asc' } },
                  },
                  orderBy: { order: 'asc' },
               },
            },
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
            orderBy: { date: 'desc' },
         }),
         prisma.workoutLog.count({ where }),
      ]);
   },

   findById(id: string) {
      return prisma.workoutLog.findUnique({
         where: { id },
         include: {
            workoutPlan: { select: { id: true, name: true } },
            exercises: {
               include: {
                  exercise: true,
                  sets: { orderBy: { setNumber: 'asc' } },
               },
               orderBy: { order: 'asc' },
            },
         },
      });
   },

   create(userId: string, data: CreateWorkoutLogInput) {
      const { exercises, ...logData } = data;
      return prisma.workoutLog.create({
         data: {
            ...logData,
            userId,
            date: logData.date ? new Date(logData.date) : new Date(),
            startTime: logData.startTime ? new Date(logData.startTime) : null,
            endTime: logData.endTime ? new Date(logData.endTime) : null,
            exercises: {
               create: exercises.map((e) => ({
                  exerciseId: e.exerciseId,
                  order: e.order,
                  notes: e.notes,
                  sets: {
                     create: e.sets.map((s) => ({
                        setNumber: s.setNumber,
                        reps: s.reps,
                        weight: s.weight,
                        notes: s.notes,
                     })),
                  },
               })),
            },
         },
         include: {
            workoutPlan: { select: { id: true, name: true } },
            exercises: {
               include: {
                  exercise: true,
                  sets: { orderBy: { setNumber: 'asc' } },
               },
               orderBy: { order: 'asc' },
            },
         },
      });
   },

   update(id: string, data: UpdateWorkoutLogInput) {
      const { exercises, ...logFields } = data;

      return prisma.$transaction(async (tx) => {
         if (exercises) {
            await tx.workoutLogExercise.deleteMany({ where: { workoutLogId: id } });

            for (const ex of exercises) {
               await tx.workoutLogExercise.create({
                  data: {
                     workoutLogId: id,
                     exerciseId: ex.exerciseId,
                     order: ex.order,
                     notes: ex.notes,
                     sets: {
                        create: ex.sets.map((s) => ({
                           setNumber: s.setNumber,
                           reps: s.reps,
                           weight: s.weight,
                           notes: s.notes,
                        })),
                     },
                  },
               });
            }
         }

         return tx.workoutLog.update({
            where: { id },
            data: {
               ...(logFields.isComplete !== undefined && { isComplete: logFields.isComplete }),
               ...(logFields.notes !== undefined && { notes: logFields.notes }),
               ...(logFields.date !== undefined && { date: new Date(logFields.date) }),
               ...(logFields.startTime !== undefined && { startTime: logFields.startTime ? new Date(logFields.startTime) : null }),
               ...(logFields.endTime !== undefined && { endTime: logFields.endTime ? new Date(logFields.endTime) : null }),
               ...(logFields.workoutPlanId !== undefined && { workoutPlanId: logFields.workoutPlanId }),
            },
            include: {
               workoutPlan: { select: { id: true, name: true } },
               exercises: {
                  include: {
                     exercise: true,
                     sets: { orderBy: { setNumber: 'asc' } },
                  },
                  orderBy: { order: 'asc' },
               },
            },
         });
      });
   },

   delete(id: string) {
      return prisma.workoutLog.delete({ where: { id } });
   },
};
