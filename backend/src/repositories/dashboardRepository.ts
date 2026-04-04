import prisma from '../config/database';

export const dashboardRepository = {
   getWeeklyWorkouts(userId: string, startDate: Date, endDate: Date) {
      return prisma.workoutLog.count({
         where: {
            userId,
            date: { gte: startDate, lte: endDate },
         },
      });
   },

   getMuscleGroupVolume(userId: string, startDate: Date, endDate: Date) {
      return prisma.workoutLogExercise.findMany({
         where: {
            workoutLog: {
               userId,
               date: { gte: startDate, lte: endDate },
            },
         },
         include: {
            exercise: { select: { muscleGroup: true } },
            sets: true,
         },
      });
   },

   getCardioSessions(userId: string, startDate: Date, endDate: Date) {
      return prisma.workoutLog.findMany({
         where: {
            userId,
            date: { gte: startDate, lte: endDate },
            exercises: {
               some: { exercise: { muscleGroup: 'CARDIO' } },
            },
         },
         include: {
            exercises: {
               where: { exercise: { muscleGroup: 'CARDIO' } },
               include: { exercise: true, sets: true },
            },
         },
      });
   },

   getExerciseHistory(userId: string, exerciseId: string, limit: number = 20) {
      return prisma.workoutLogExercise.findMany({
         where: {
            exerciseId,
            workoutLog: { userId },
         },
         include: {
            sets: { orderBy: { setNumber: 'asc' } },
            workoutLog: { select: { date: true } },
         },
         orderBy: { workoutLog: { date: 'desc' } },
         take: limit,
      });
   },

   getStreak(userId: string) {
      return prisma.workoutLog.findMany({
         where: { userId },
         select: { date: true },
         orderBy: { date: 'desc' },
         distinct: ['date'],
      });
   },

   getTotalVolume(userId: string, startDate: Date, endDate: Date) {
      return prisma.workoutLogSet.findMany({
         where: {
            workoutLogExercise: {
               workoutLog: {
                  userId,
                  date: { gte: startDate, lte: endDate },
               },
            },
         },
      });
   },

   getBodyWeightHistory(userId: string, limit: number = 30) {
      return prisma.bodyWeight.findMany({
         where: { userId },
         orderBy: { date: 'desc' },
         take: limit,
      });
   },
};
