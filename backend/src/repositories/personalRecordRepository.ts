import prisma from '../config/database';

export const personalRecordRepository = {
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
