import prisma from '../config/database';
import { CreateWorkoutPlanInput } from '../models/schemas';

export const workoutPlanRepository = {
   findAllByUser(userId: string, includeArchived: boolean, page: number, limit: number) {
      const where: any = { userId };
      if (!includeArchived) where.isArchived = false;

      return Promise.all([
         prisma.workoutPlan.findMany({
            where,
            include: {
               exercises: {
                  include: { exercise: true },
                  orderBy: { order: 'asc' },
               },
               _count: { select: { workoutLogs: true } },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updatedAt: 'desc' },
         }),
         prisma.workoutPlan.count({ where }),
      ]);
   },

   findById(id: string) {
      return prisma.workoutPlan.findUnique({
         where: { id },
         include: {
            exercises: {
               include: { exercise: true },
               orderBy: { order: 'asc' },
            },
         },
      });
   },

   create(userId: string, data: CreateWorkoutPlanInput) {
      const { exercises, ...planData } = data;
      return prisma.workoutPlan.create({
         data: {
            ...planData,
            userId,
            exercises: exercises
               ? {
                  create: exercises.map((e) => ({
                     exerciseId: e.exerciseId,
                     sets: e.sets,
                     reps: e.reps,
                     restSeconds: e.restSeconds,
                     order: e.order,
                     notes: e.notes,
                  })),
               }
               : undefined,
         },
         include: {
            exercises: {
               include: { exercise: true },
               orderBy: { order: 'asc' },
            },
         },
      });
   },

   async update(id: string, data: any) {
      const { exercises, ...planData } = data;

      if (exercises) {
         await prisma.workoutPlanExercise.deleteMany({ where: { workoutPlanId: id } });
      }

      return prisma.workoutPlan.update({
         where: { id },
         data: {
            ...planData,
            exercises: exercises
               ? {
                  create: exercises.map((e: any) => ({
                     exerciseId: e.exerciseId,
                     sets: e.sets,
                     reps: e.reps,
                     restSeconds: e.restSeconds,
                     order: e.order,
                     notes: e.notes,
                  })),
               }
               : undefined,
         },
         include: {
            exercises: {
               include: { exercise: true },
               orderBy: { order: 'asc' },
            },
         },
      });
   },

   async duplicate(id: string, userId: string) {
      const original = await prisma.workoutPlan.findUnique({
         where: { id },
         include: { exercises: true },
      });

      if (!original) return null;

      return prisma.workoutPlan.create({
         data: {
            name: `${original.name} (Copy)`,
            description: original.description,
            userId,
            exercises: {
               create: original.exercises.map((e) => ({
                  exerciseId: e.exerciseId,
                  sets: e.sets,
                  reps: e.reps,
                  restSeconds: e.restSeconds,
                  order: e.order,
                  notes: e.notes,
               })),
            },
         },
         include: {
            exercises: {
               include: { exercise: true },
               orderBy: { order: 'asc' },
            },
         },
      });
   },

   delete(id: string) {
      return prisma.workoutPlan.update({
         where: { id },
         data: { isArchived: true },
      });
   },
};
