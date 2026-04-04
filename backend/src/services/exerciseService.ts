import { exerciseRepository } from '../repositories/exerciseRepository';
import { CreateExerciseInput, UpdateExerciseInput } from '../models/schemas';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const exerciseService = {
   async findAll(userId: string, filters: {
      muscleGroup?: string;
      type?: string;
      equipment?: string;
      search?: string;
      page: number;
      limit: number;
   }) {
      const [exercises, total] = await exerciseRepository.findAll({ ...filters, userId });
      return {
         exercises,
         total,
         page: filters.page,
         totalPages: Math.ceil(total / filters.limit),
      };
   },

   async findById(id: string) {
      const exercise = await exerciseRepository.findById(id);
      if (!exercise) throw new NotFoundError('Exercise');
      return exercise;
   },

   async create(userId: string, data: CreateExerciseInput) {
      return exerciseRepository.create({ ...data, userId, isCustom: true });
   },

   async update(userId: string, id: string, data: UpdateExerciseInput) {
      const exercise = await exerciseRepository.findById(id);
      if (!exercise) throw new NotFoundError('Exercise');
      if (!exercise.isCustom || exercise.userId !== userId) {
         throw new ForbiddenError('Can only edit your own custom exercises');
      }
      return exerciseRepository.update(id, data);
   },

   async delete(userId: string, id: string) {
      const exercise = await exerciseRepository.findById(id);
      if (!exercise) throw new NotFoundError('Exercise');
      if (!exercise.isCustom || exercise.userId !== userId) {
         throw new ForbiddenError('Can only delete your own custom exercises');
      }
      return exerciseRepository.delete(id);
   },

   async getMuscleGroups() {
      const groups = await exerciseRepository.getMuscleGroups();
      return groups.map((g) => g.muscleGroup);
   },
};
