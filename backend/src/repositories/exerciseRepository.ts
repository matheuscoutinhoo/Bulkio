import prisma from '../config/database';

export const exerciseRepository = {
   findAll(filters: {
      muscleGroup?: string;
      type?: string;
      equipment?: string;
      search?: string;
      page: number;
      limit: number;
   }) {
      const where: any = {};

      if (filters.muscleGroup) where.muscleGroup = filters.muscleGroup;
      if (filters.type) where.type = filters.type;
      if (filters.equipment) where.equipment = filters.equipment;
      if (filters.search) {
         where.name = { contains: filters.search, mode: 'insensitive' };
      }

      return Promise.all([
         prisma.exercise.findMany({
            where,
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
            orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
         }),
         prisma.exercise.count({ where }),
      ]);
   },

   findById(id: string) {
      return prisma.exercise.findUnique({ where: { id } });
   },

   getMuscleGroups() {
      return prisma.exercise.findMany({
         select: { muscleGroup: true },
         distinct: ['muscleGroup'],
         orderBy: { muscleGroup: 'asc' },
      });
   },
};
