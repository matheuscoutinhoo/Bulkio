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
};
