import api from '@/lib/api';

export interface Exercise {
   id: string;
   name: string;
   muscleGroup: string;
   type: string;
   equipment: string;
   description?: string;
   videoUrl?: string | null;
}

export interface ExerciseFilters {
   page?: number;
   limit?: number;
   muscleGroup?: string;
   type?: string;
   equipment?: string;
   search?: string;
}

export const exerciseApi = {
   getAll: (filters?: ExerciseFilters) =>
      api.get('/exercises', { params: filters }),
   getCatalog: async (): Promise<Exercise[]> => {
      const exercises: Exercise[] = [];
      let page = 1;
      let totalPages = 1;
      do {
         const response = await api.get<{ data: Exercise[]; pagination: { totalPages: number } }>('/exercises', { params: { page, limit: 300 } });
         exercises.push(...response.data.data);
         totalPages = response.data.pagination.totalPages;
         page++;
      } while (page <= totalPages);
      return [...new Map(exercises.map(exercise => [exercise.id, exercise])).values()];
   },
};
