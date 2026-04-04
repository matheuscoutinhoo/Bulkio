import api from '@/lib/api';

export interface DashboardStats {
   weeklyWorkouts: { current: number; previous: number };
   muscleDistribution: Record<string, number>;
   streak: number;
   totalVolume: number;
   bodyWeight: {
      history: { weight: number; date: string }[];
      current: { weight: number; date: string } | null;
      goal: string | null;
      target: number | null;
      initial: number | null;
   };
   personalRecords: {
      id: string;
      weight: number;
      reps: number;
      date: string;
      exercise: { id: string; name: string; muscleGroup: string };
   }[];
}

export interface ExerciseProgression {
   date: string;
   sets: { setNumber: number; reps: number; weight: number }[];
   maxWeight: number;
   totalVolume: number;
}

export const dashboardApi = {
   getStats: () => api.get('/dashboard/stats'),
   getExerciseProgression: (exerciseId: string) =>
      api.get(`/dashboard/exercise-progression/${exerciseId}`),
};
