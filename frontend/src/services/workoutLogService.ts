import api from '@/lib/api';

export interface WorkoutLogSet {
   id: string;
   setNumber: number;
   reps: number;
   weight: number;
   notes?: string;
}

export interface WorkoutLogExercise {
   id: string;
   exerciseId: string;
   order: number;
   notes?: string;
   exercise: {
      id: string;
      name: string;
      muscleGroup: string;
      type: string;
      equipment: string;
   };
   sets: WorkoutLogSet[];
}

export interface WorkoutLog {
   id: string;
   date: string;
   startTime?: string;
   endTime?: string;
   isComplete: boolean;
   notes?: string;
   workoutPlan?: { id: string; name: string };
   exercises: WorkoutLogExercise[];
   createdAt: string;
}

export interface CreateWorkoutLogData {
   workoutPlanId?: string | null;
   date?: string;
   startTime?: string | null;
   endTime?: string | null;
   isComplete?: boolean;
   notes?: string;
   exercises: {
      exerciseId: string;
      order: number;
      notes?: string;
      sets: {
         setNumber: number;
         reps: number;
         weight: number;
         notes?: string;
      }[];
   }[];
}

export interface WorkoutLogFilters {
   page?: number;
   limit?: number;
   startDate?: string;
   endDate?: string;
   exerciseId?: string;
   muscleGroup?: string;
   workoutPlanId?: string;
}

export const workoutLogApi = {
   getAll: (filters?: WorkoutLogFilters) =>
      api.get('/workout-logs', { params: filters }),
   getById: (id: string) => api.get(`/workout-logs/${id}`),
   create: (data: CreateWorkoutLogData) => api.post('/workout-logs', data),
   update: (id: string, data: { isComplete?: boolean; notes?: string | null; endTime?: string | null }) =>
      api.patch(`/workout-logs/${id}`, data),
   delete: (id: string) => api.delete(`/workout-logs/${id}`),
};
