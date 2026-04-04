import prisma from '../config/database';
import { CreateExerciseInput, UpdateExerciseInput } from '../models/schemas';

export const exerciseRepository = {
   findAll(filters: {
      muscleGroup?: string;
      type?: string;
      equipment?: string;
      search?: string;
      userId?: string;
      page: number;
      limit: number;
   }) {
      const where: any = {
         OR: [{ isCustom: false }, { userId: filters.userId }],
      };

      if (filters.muscleGroup) where.muscleGroup = filters.muscleGroup;
      if (filters.type) where.type = filters.type;
      if (filters.equipment) where.equipment = filters.equipment;
      if (filters.search) {
         where.name = { contains: filters.search };
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

   create(data: CreateExerciseInput & { userId: string; isCustom: boolean }) {
      return prisma.exercise.create({ data });
   },

   update(id: string, data: UpdateExerciseInput) {
      return prisma.exercise.update({ where: { id }, data });
   },

   delete(id: string) {
      return prisma.exercise.delete({ where: { id } });
   },

   getMuscleGroups() {
      return prisma.exercise.findMany({
         select: { muscleGroup: true },
         distinct: ['muscleGroup'],
         orderBy: { muscleGroup: 'asc' },
      });
   },
};
