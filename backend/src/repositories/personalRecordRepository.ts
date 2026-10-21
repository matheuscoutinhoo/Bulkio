import prisma from '../config/database';

export const personalRecordRepository = {
   findBestCompletedSet(userId: string, exerciseId: string) {
      return prisma.workoutLogSet.findFirst({
         where: {
            weight: { gt: 0 },
            workoutLogExercise: { exerciseId, workoutLog: { userId, isComplete: true } },
         },
         orderBy: [
            { weight: 'desc' },
            { reps: 'desc' },
            { workoutLogExercise: { workoutLog: { date: 'asc' } } },
         ],
         select: { weight: true, reps: true, workoutLogExercise: { select: { workoutLog: { select: { date: true } } } } },
      });
   },

   deleteForExercise(userId: string, exerciseId: string) {
      return prisma.personalRecord.deleteMany({ where: { userId, exerciseId } });
   },

   findByUserAndExercise(userId: string, exerciseId: string) {
      return prisma.personalRecord.findUnique({
         where: { userId_exerciseId: { userId, exerciseId } },
         include: { exercise: true },
      });
   },

   findAllByUser(userId: string) {
      return prisma.personalRecord.findMany({
         where: { userId },
         include: { exercise: true },
         orderBy: { date: 'desc' },
      });
   },

   upsert(userId: string, exerciseId: string, weight: number, reps: number, date: Date) {
      return prisma.personalRecord.upsert({
         where: { userId_exerciseId: { userId, exerciseId } },
         update: { weight, reps, date },
         create: { userId, exerciseId, weight, reps, date },
      });
   },
};
