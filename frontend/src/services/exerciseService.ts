import api from '@/lib/api';

export interface Exercise {
   id: string;
   name: string;
   muscleGroup: string;
   type: string;
   equipment: string;
   description?: string;
   isCustom: boolean;
   userId?: string | null;
}

export interface ExerciseFilters {
   page?: number;
   limit?: number;
   muscleGroup?: string;
   type?: string;
   equipment?: string;
   search?: string;
}

export interface CreateExerciseData {
   name: string;
   muscleGroup: string;
   type: string;
   equipment: string;
   description?: string;
}

export const exerciseApi = {
   getAll: (filters?: ExerciseFilters) =>
      api.get('/exercises', { params: filters }),
   getById: (id: string) => api.get(`/exercises/${id}`),
   create: (data: CreateExerciseData) => api.post('/exercises', data),
   update: (id: string, data: Partial<CreateExerciseData>) =>
      api.patch(`/exercises/${id}`, data),
   delete: (id: string) => api.delete(`/exercises/${id}`),
   getMuscleGroups: () => api.get('/exercises/muscle-groups'),
};
