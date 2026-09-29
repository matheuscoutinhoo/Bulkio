import prisma from '../config/database';
import { fromZonedTime } from 'date-fns-tz';

export const dashboardRepository = {
   getWeeklyWorkouts(userId: string, startDate: Date, endDate: Date) {
      return prisma.workoutLog.count({
         where: {
            userId,
            isComplete: true,
            date: { gte: startDate, lte: endDate },
         },
      });
   },

   getMuscleGroupVolume(userId: string, startDate: Date, endDate: Date) {
      return prisma.workoutLogExercise.findMany({
         where: {
            workoutLog: {
               userId,
               isComplete: true,
               date: { gte: startDate, lte: endDate },
            },
         },
         include: {
            exercise: { select: { muscleGroup: true } },
            sets: true,
         },
      });
   },

   getExerciseHistory(userId: string, exerciseId: string, limit: number = 20) {
      return prisma.workoutLogExercise.findMany({
         where: {
            exerciseId,
            workoutLog: { userId, isComplete: true },
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
         where: { userId, isComplete: true },
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
                  isComplete: true,
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

   getYearlyWorkoutDays(userId: string, year: number, timeZone: string) {
      const startDate = fromZonedTime(`${year}-01-01T00:00:00`, timeZone);
      const endDate = fromZonedTime(`${year + 1}-01-01T00:00:00`, timeZone);
      return prisma.workoutLog.findMany({
         where: {
            userId,
            isComplete: true,
            date: { gte: startDate, lt: endDate },
         },
         select: { date: true },
      });
   },
};
