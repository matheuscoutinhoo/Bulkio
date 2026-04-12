import { dashboardRepository } from '../repositories/dashboardRepository';
import { personalRecordRepository } from '../repositories/personalRecordRepository';
import { userRepository } from '../repositories/userRepository';
import { calculateStreak } from '../utils/streakCalculator';

function getWeekBounds(weeksAgo: number = 0): { start: Date; end: Date } {
   const now = new Date();
   const daysSinceMonday = (now.getDay() + 6) % 7;
   const startOfWeek = new Date(now);
   startOfWeek.setDate(now.getDate() - daysSinceMonday - weeksAgo * 7);
   startOfWeek.setHours(0, 0, 0, 0);

   const endOfWeek = new Date(startOfWeek);
   endOfWeek.setDate(startOfWeek.getDate() + 6);
   endOfWeek.setHours(23, 59, 59, 999);

   return { start: startOfWeek, end: endOfWeek };
}

export const dashboardService = {
   async getStats(userId: string) {
      const thisWeek = getWeekBounds(0);
      const lastWeek = getWeekBounds(1);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
         thisWeekWorkouts,
         lastWeekWorkouts,
         muscleGroupData,
         streak,
         volumeData,
         bodyWeightHistory,
         personalRecords,
         user,
         yearlyWorkouts,
      ] = await Promise.all([
         dashboardRepository.getWeeklyWorkouts(userId, thisWeek.start, thisWeek.end),
         dashboardRepository.getWeeklyWorkouts(userId, lastWeek.start, lastWeek.end),
         dashboardRepository.getMuscleGroupVolume(userId, thirtyDaysAgo, new Date()),
         dashboardRepository.getStreak(userId),
         dashboardRepository.getTotalVolume(userId, thirtyDaysAgo, new Date()),
         dashboardRepository.getBodyWeightHistory(userId, 30),
         personalRecordRepository.findAllByUser(userId),
         userRepository.findById(userId),
         dashboardRepository.getYearlyWorkoutDays(userId, new Date().getFullYear()),
      ]);

      // Calculate muscle group distribution
      const muscleDistribution: Record<string, number> = {};
      for (const entry of muscleGroupData) {
         const group = entry.exercise.muscleGroup;
         const sets = entry.sets.length;
         muscleDistribution[group] = (muscleDistribution[group] || 0) + sets;
      }

      // Calculate streak
      const currentStreak = calculateStreak(streak.map(s => s.date));

      // Calculate total volume
      const totalVolume = volumeData.reduce((sum, set) => sum + set.reps * set.weight, 0);

      // bodyWeightHistory is ordered DESC — index 0 is the latest
      const currentWeight = bodyWeightHistory.length > 0 ? bodyWeightHistory[0] : null;
      const historyAsc = [...bodyWeightHistory].reverse();

      // Build yearly activity map: { 'YYYY-MM-DD': count }
      const yearlyActivity: Record<string, number> = {};
      for (const log of yearlyWorkouts) {
         const d = new Date(log.date);
         const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
         yearlyActivity[key] = (yearlyActivity[key] || 0) + 1;
      }

      return {
         weeklyWorkouts: {
            current: thisWeekWorkouts,
            previous: lastWeekWorkouts,
         },
         muscleDistribution,
         streak: currentStreak,
         totalVolume: Math.round(totalVolume),
         bodyWeight: {
            history: historyAsc,
            current: currentWeight,
            goal: user?.goal || null,
            target: user?.targetWeight || null,
            initial: user?.initialWeight || null,
         },
         personalRecords: personalRecords.slice(0, 10),
         yearlyActivity,
      };
   },

   async getExerciseProgression(userId: string, exerciseId: string) {
      const history = await dashboardRepository.getExerciseHistory(userId, exerciseId, 30);

      return history.map((entry) => ({
         date: entry.workoutLog.date,
         sets: entry.sets.map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
         })),
         maxWeight: entry.sets.length > 0 ? Math.max(...entry.sets.map((s) => s.weight)) : 0,
         totalVolume: entry.sets.reduce((sum, s) => sum + s.reps * s.weight, 0),
      })).reverse();
   },
};
