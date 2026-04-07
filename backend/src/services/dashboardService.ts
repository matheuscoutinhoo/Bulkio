import { dashboardRepository } from '../repositories/dashboardRepository';
import { personalRecordRepository } from '../repositories/personalRecordRepository';
import { userRepository } from '../repositories/userRepository';

function getWeekBounds(weeksAgo: number = 0): { start: Date; end: Date } {
   const now = new Date();
   const dayOfWeek = now.getDay();
   const startOfWeek = new Date(now);
   startOfWeek.setDate(now.getDate() - dayOfWeek - weeksAgo * 7);
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

      // Calculate streak — deduplicate by calendar date first
      let currentStreak = 0;
      if (streak.length > 0) {
         const today = new Date();
         today.setHours(0, 0, 0, 0);

         const uniqueDates: number[] = [];
         for (const s of streak) {
            const d = new Date(s.date);
            d.setHours(0, 0, 0, 0);
            const t = d.getTime();
            if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1] !== t) {
               uniqueDates.push(t);
            }
         }

         // Determine the anchor: today or yesterday
         let anchor = today.getTime();
         if (uniqueDates[0] !== anchor) {
            const yesterday = today.getTime() - 86400000;
            if (uniqueDates[0] === yesterday) {
               anchor = yesterday;
            } else {
               // Most recent workout is older than yesterday — no streak
               uniqueDates.length = 0;
            }
         }

         for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = anchor - i * 86400000;
            if (uniqueDates[i] === expectedDate) {
               currentStreak++;
            } else {
               break;
            }
         }
      }

      // Calculate total volume
      const totalVolume = volumeData.reduce((sum, set) => sum + set.reps * set.weight, 0);

      // bodyWeightHistory is ordered DESC — index 0 is the latest
      const currentWeight = bodyWeightHistory.length > 0 ? bodyWeightHistory[0] : null;
      const historyAsc = [...bodyWeightHistory].reverse();

      // Build yearly activity map: { 'YYYY-MM-DD': count }
      const yearlyActivity: Record<string, number> = {};
      for (const log of yearlyWorkouts) {
         const key = new Date(log.date).toISOString().split('T')[0];
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
