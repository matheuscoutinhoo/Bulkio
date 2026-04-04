import prisma from '../config/database';

export const bodyWeightRepository = {
   findAllByUser(userId: string, page: number, limit: number) {
      return Promise.all([
         prisma.bodyWeight.findMany({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { date: 'desc' },
         }),
         prisma.bodyWeight.count({ where: { userId } }),
      ]);
   },

   findById(id: string) {
      return prisma.bodyWeight.findUnique({ where: { id } });
   },

   create(userId: string, data: { weight: number; date?: string }) {
      return prisma.bodyWeight.create({
         data: {
            userId,
            weight: data.weight,
            date: data.date ? new Date(data.date) : new Date(),
         },
      });
   },

   delete(id: string) {
      return prisma.bodyWeight.delete({ where: { id } });
   },

   getLatest(userId: string) {
      return prisma.bodyWeight.findFirst({
         where: { userId },
         orderBy: { date: 'desc' },
      });
   },
};
