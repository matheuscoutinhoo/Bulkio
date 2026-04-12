import api from '@/lib/api';

export interface WorkoutPlanExercise {
   id: string;
   exerciseId: string;
   sets: number;
   reps: string;
   restSeconds: number;
   weight?: number | null;
   order: number;
   notes?: string;
   exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      type: string;
      equipment: string;
      videoUrl?: string | null;
   };
}

export interface WorkoutPlan {
   id: string;
   name: string;
   description?: string;
   isArchived: boolean;
   exercises: WorkoutPlanExercise[];
   _count?: { workoutLogs: number };
   createdAt: string;
   updatedAt: string;
}

export interface CreateWorkoutPlanData {
   name: string;
   description?: string;
   exercises?: {
      exerciseId: string;
      sets: number;
      reps: string;
      restSeconds?: number;
      weight?: number | null;
      order: number;
      notes?: string;
   }[];
}

export interface GenerateWorkoutData {
   level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
   focus: string;
   description?: string;
}

export const workoutPlanApi = {
   getAll: (params?: { page?: number; limit?: number; includeArchived?: boolean }) =>
      api.get('/workouts', { params }),
   getById: (id: string) => api.get(`/workouts/${id}`),
   create: (data: CreateWorkoutPlanData) => api.post('/workouts', data),
   update: (id: string, data: Partial<CreateWorkoutPlanData & { isArchived?: boolean }>) =>
      api.patch(`/workouts/${id}`, data),
   duplicate: (id: string) => api.post(`/workouts/${id}/duplicate`),
   archive: (id: string) => api.delete(`/workouts/${id}`),
   generate: (data: GenerateWorkoutData) => api.post('/workouts/generate', data),
};
