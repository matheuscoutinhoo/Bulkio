import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { CreateWorkoutPlanInput, UpdateWorkoutPlanInput } from '../models/schemas';

const exercisesInclude = {
   exercises: {
      include: { exercise: true },
      orderBy: { order: 'asc' as const },
   },
};

function toExerciseCreateData(exercises: CreateWorkoutPlanInput['exercises']) {
   if (!exercises) return undefined;
   return {
      create: exercises.map((e) => ({
         exerciseId: e.exerciseId,
         sets: e.sets,
         reps: e.reps,
         restSeconds: e.restSeconds,
         weight: e.weight ?? null,
         order: e.order,
         notes: e.notes,
      })),
   };
}

export const workoutPlanRepository = {
   findAllByUser(userId: string, page: number, limit: number) {
      const where: Prisma.WorkoutPlanWhereInput = { userId };

      return Promise.all([
         prisma.workoutPlan.findMany({
            where,
            include: {
               ...exercisesInclude,
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
         include: exercisesInclude,
      });
   },

   create(userId: string, data: CreateWorkoutPlanInput) {
      const { exercises, ...planData } = data;
      return prisma.workoutPlan.create({
         data: {
            ...planData,
            userId,
            exercises: toExerciseCreateData(exercises),
         },
         include: exercisesInclude,
      });
   },

   async update(id: string, data: UpdateWorkoutPlanInput) {
      const { exercises, ...planData } = data;

      if (exercises) {
         return prisma.$transaction(async (tx) => {
            await tx.workoutPlanExercise.deleteMany({ where: { workoutPlanId: id } });
            return tx.workoutPlan.update({
               where: { id },
               data: {
                  ...planData,
                  exercises: toExerciseCreateData(exercises),
               },
               include: exercisesInclude,
            });
         });
      }

      return prisma.workoutPlan.update({
         where: { id },
         data: planData,
         include: exercisesInclude,
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
            exercises: toExerciseCreateData(original.exercises),
         },
         include: exercisesInclude,
      });
   },

   delete(id: string) {
      return prisma.workoutPlan.delete({
         where: { id },
      });
   },
};
