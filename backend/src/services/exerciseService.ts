import { exerciseRepository } from '../repositories/exerciseRepository';
import { NotFoundError } from '../utils/errors';

export const exerciseService = {
   async findAll(filters: {
      muscleGroup?: string;
      type?: string;
      equipment?: string;
      search?: string;
      page: number;
      limit: number;
   }) {
      const [exercises, total] = await exerciseRepository.findAll(filters);
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

   async getMuscleGroups() {
      const groups = await exerciseRepository.getMuscleGroups();
      return groups.map((g) => g.muscleGroup);
   },
};
