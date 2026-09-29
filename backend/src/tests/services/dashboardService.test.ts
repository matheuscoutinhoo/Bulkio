import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dashboardService } from '../../services/dashboardService';
import { createMockUser, createMockBodyWeight, createMockPR } from '../helpers';

vi.mock('../../repositories/dashboardRepository', () => ({
   dashboardRepository: {
      getWeeklyWorkouts: vi.fn(),
      getMuscleGroupVolume: vi.fn(),
      getStreak: vi.fn(),
      getTotalVolume: vi.fn(),
      getBodyWeightHistory: vi.fn(),
      getExerciseHistory: vi.fn(),
      getYearlyWorkoutDays: vi.fn(),
   },
}));

vi.mock('../../repositories/personalRecordRepository', () => ({
   personalRecordRepository: {
      findAllByUser: vi.fn(),
   },
}));

vi.mock('../../repositories/userRepository', () => ({
   userRepository: {
      findById: vi.fn(),
   },
}));

import { dashboardRepository } from '../../repositories/dashboardRepository';
import { personalRecordRepository } from '../../repositories/personalRecordRepository';
import { userRepository } from '../../repositories/userRepository';

const mockDashRepo = vi.mocked(dashboardRepository);
const mockPRRepo = vi.mocked(personalRecordRepository);
const mockUserRepo = vi.mocked(userRepository);

function setupDefaultMocks() {
   mockDashRepo.getWeeklyWorkouts.mockResolvedValue(0 as any);
   mockDashRepo.getMuscleGroupVolume.mockResolvedValue([] as any);
   mockDashRepo.getStreak.mockResolvedValue([] as any);
   mockDashRepo.getTotalVolume.mockResolvedValue([] as any);
   mockDashRepo.getBodyWeightHistory.mockResolvedValue([] as any);
   mockDashRepo.getYearlyWorkoutDays.mockResolvedValue([] as any);
   mockPRRepo.findAllByUser.mockResolvedValue([] as any);
   mockUserRepo.findById.mockResolvedValue(createMockUser() as any);
}

describe('dashboardService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   // ========== getStats ==========
   describe('getStats', () => {
      it('should group late-night workouts by the user time zone', async () => {
         setupDefaultMocks();
         mockDashRepo.getYearlyWorkoutDays.mockResolvedValue([
            { date: new Date('2026-09-29T01:00:00.000Z') },
         ]);

         const result = await dashboardService.getStats('user-1', 'America/Sao_Paulo');

         expect(result.yearlyActivity).toEqual({ '2026-09-28': 1 });
      });

      it('should use the local week and year across UTC midnight', async () => {
         vi.useFakeTimers();
         vi.setSystemTime(new Date('2026-01-01T01:00:00Z'));
         setupDefaultMocks();
         mockDashRepo.getStreak.mockResolvedValue([{ date: new Date('2025-12-30T23:00:00Z') }]);

         const result = await dashboardService.getStats('user-1', 'America/Sao_Paulo');

         expect(mockDashRepo.getWeeklyWorkouts).toHaveBeenNthCalledWith(1, 'user-1',
            new Date('2025-12-28T03:00:00Z'), new Date('2026-01-04T02:59:59.999Z'));
         expect(mockDashRepo.getYearlyWorkoutDays).toHaveBeenCalledWith('user-1', 2025, 'America/Sao_Paulo');
         expect(result.streak).toBe(1);
      });

      it('should return weeklyWorkouts with current and previous counts', async () => {
         setupDefaultMocks();
         mockDashRepo.getWeeklyWorkouts
            .mockResolvedValueOnce(5 as any)   // thisWeek
            .mockResolvedValueOnce(3 as any);  // lastWeek

         const result = await dashboardService.getStats('user-1');

         expect(result.weeklyWorkouts).toEqual({ current: 5, previous: 3 });
      });

      it('should calculate muscle distribution from grouped volume data', async () => {
         setupDefaultMocks();
         mockDashRepo.getMuscleGroupVolume.mockResolvedValue([
            { exercise: { muscleGroup: 'CHEST' }, sets: [1, 2, 3] },
            { exercise: { muscleGroup: 'CHEST' }, sets: [1, 2] },
            { exercise: { muscleGroup: 'BACK' }, sets: [1] },
         ] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.muscleDistribution).toEqual({ CHEST: 5, BACK: 1 });
      });

      it('should return streak = 0 when no workouts exist', async () => {
         setupDefaultMocks();

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(0);
      });

      it('should return streak = 1 when last workout was today', async () => {
         setupDefaultMocks();
         const today = new Date();
         today.setHours(10, 0, 0, 0);
         mockDashRepo.getStreak.mockResolvedValue([{ date: today }] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(1);
      });

      it('should return streak = 1 when last workout was yesterday', async () => {
         setupDefaultMocks();
         const yesterday = new Date();
         yesterday.setDate(yesterday.getDate() - 1);
         yesterday.setHours(14, 0, 0, 0);
         mockDashRepo.getStreak.mockResolvedValue([{ date: yesterday }] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(1);
      });

      it('should return streak = 0 when last workout is older than yesterday', async () => {
         setupDefaultMocks();
         const twoDaysAgo = new Date();
         twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
         mockDashRepo.getStreak.mockResolvedValue([{ date: twoDaysAgo }] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(0);
      });

      it('should count consecutive days for multi-day streak', async () => {
         setupDefaultMocks();
         const today = new Date();
         const d1 = new Date(today); d1.setHours(10, 0, 0, 0);
         const d2 = new Date(today); d2.setDate(d2.getDate() - 1); d2.setHours(15, 0, 0, 0);
         const d3 = new Date(today); d3.setDate(d3.getDate() - 2); d3.setHours(8, 0, 0, 0);

         mockDashRepo.getStreak.mockResolvedValue([
            { date: d1 }, { date: d2 }, { date: d3 },
         ] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(3);
      });

      it('should deduplicate multiple workouts on the same calendar day', async () => {
         setupDefaultMocks();
         const today = new Date();
         const morning = new Date(today); morning.setHours(8, 0, 0, 0);
         const evening = new Date(today); evening.setHours(18, 0, 0, 0);

         mockDashRepo.getStreak.mockResolvedValue([
            { date: evening }, { date: morning },
         ] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(1); // Same day, not 2
      });

      it('should break streak when there is a gap', async () => {
         setupDefaultMocks();
         const today = new Date();
         const d1 = new Date(today); d1.setHours(10, 0, 0, 0);
         const d3 = new Date(today); d3.setDate(d3.getDate() - 2); d3.setHours(10, 0, 0, 0);
         // No workout yesterday — gap

         mockDashRepo.getStreak.mockResolvedValue([
            { date: d1 }, { date: d3 },
         ] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.streak).toBe(1); // Only today counts
      });

      it('should calculate totalVolume as sum of reps * weight, rounded', async () => {
         setupDefaultMocks();
         mockDashRepo.getTotalVolume.mockResolvedValue([
            { reps: 10, weight: 60 },   // 600
            { reps: 8, weight: 80 },     // 640
            { reps: 5, weight: 100.5 },  // 502.5
         ] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.totalVolume).toBe(1743); // round(600+640+502.5)
      });

      it('should return bodyWeight.current as most recent (index 0 from DESC)', async () => {
         setupDefaultMocks();
         const latest = createMockBodyWeight({ weight: 85 });
         const older = createMockBodyWeight({ weight: 83, id: 'bw-2' });
         mockDashRepo.getBodyWeightHistory.mockResolvedValue([latest, older] as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.bodyWeight.current).toEqual(latest);
      });

      it('should return bodyWeight.history in ascending order', async () => {
         setupDefaultMocks();
         const latest = createMockBodyWeight({ weight: 85, id: 'bw-1' });
         const older = createMockBodyWeight({ weight: 83, id: 'bw-2' });
         mockDashRepo.getBodyWeightHistory.mockResolvedValue([latest, older] as any);

         const result = await dashboardService.getStats('user-1');

         // DESC input: [85, 83] → ASC output: [83, 85]
         expect(result.bodyWeight.history[0]).toEqual(older);
         expect(result.bodyWeight.history[1]).toEqual(latest);
      });

      it('should return bodyWeight.current as null when no records exist', async () => {
         setupDefaultMocks();

         const result = await dashboardService.getStats('user-1');

         expect(result.bodyWeight.current).toBeNull();
      });

      it('should return user goal/target/initial from profile', async () => {
         setupDefaultMocks();
         mockUserRepo.findById.mockResolvedValue(
            createMockUser({ goal: 'BULK', targetWeight: 90, initialWeight: 80 }) as any,
         );

         const result = await dashboardService.getStats('user-1');

         expect(result.bodyWeight.goal).toBe('BULK');
         expect(result.bodyWeight.target).toBe(90);
         expect(result.bodyWeight.initial).toBe(80);
      });

      it('should return at most 10 personal records', async () => {
         setupDefaultMocks();
         const prs = Array.from({ length: 15 }, (_, i) =>
            createMockPR({ id: `pr-${i}` }),
         );
         mockPRRepo.findAllByUser.mockResolvedValue(prs as any);

         const result = await dashboardService.getStats('user-1');

         expect(result.personalRecords).toHaveLength(10);
      });
   });

   // ========== getExerciseProgression ==========
   describe('getExerciseProgression', () => {
      it('should map exercise history to progression entries', async () => {
         mockDashRepo.getExerciseHistory.mockResolvedValue([
            {
               workoutLog: { date: new Date('2024-01-15') },
               sets: [
                  { setNumber: 1, reps: 10, weight: 60 },
                  { setNumber: 2, reps: 8, weight: 70 },
               ],
            },
         ] as any);

         const result = await dashboardService.getExerciseProgression('user-1', 'ex-1');

         expect(result).toHaveLength(1);
         expect(result[0].maxWeight).toBe(70);
         expect(result[0].totalVolume).toBe(10 * 60 + 8 * 70); // 1160
         expect(result[0].sets).toHaveLength(2);
      });

      it('should return maxWeight as 0 when entry has no sets', async () => {
         mockDashRepo.getExerciseHistory.mockResolvedValue([
            {
               workoutLog: { date: new Date('2024-01-15') },
               sets: [],
            },
         ] as any);

         const result = await dashboardService.getExerciseProgression('user-1', 'ex-1');

         expect(result[0].maxWeight).toBe(0);
         expect(result[0].totalVolume).toBe(0);
      });

      it('should return results in ascending chronological order', async () => {
         mockDashRepo.getExerciseHistory.mockResolvedValue([
            { workoutLog: { date: new Date('2024-01-20') }, sets: [{ setNumber: 1, reps: 5, weight: 100 }] },
            { workoutLog: { date: new Date('2024-01-15') }, sets: [{ setNumber: 1, reps: 5, weight: 90 }] },
         ] as any);

         const result = await dashboardService.getExerciseProgression('user-1', 'ex-1');

         // Input DESC → reversed to ASC
         expect(result[0].date).toEqual(new Date('2024-01-15'));
         expect(result[1].date).toEqual(new Date('2024-01-20'));
      });
   });
});
