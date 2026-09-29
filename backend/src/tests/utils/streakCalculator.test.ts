import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateStreak } from '../../utils/streakCalculator';

describe('calculateStreak', () => {
   afterEach(() => {
      vi.useRealTimers();
   });

   it('should return 0 for empty dates', () => {
      expect(calculateStreak([])).toBe(0);
   });

   it('should count local consecutive days across daylight saving time', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-03-09T16:00:00Z'));

      expect(calculateStreak([
         new Date('2026-03-09T15:00:00Z'),
         new Date('2026-03-08T16:00:00Z'),
         new Date('2026-03-07T16:00:00Z'),
      ], 'America/New_York')).toBe(3);
   });

   it('should return 1 when only today has a workout', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));

      expect(calculateStreak([new Date('2024-03-15')])).toBe(1);
   });

   it('should return streak for consecutive days ending today', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));

      const dates = [
         new Date('2024-03-15'),
         new Date('2024-03-14'),
         new Date('2024-03-13'),
      ];
      expect(calculateStreak(dates)).toBe(3);
   });

   it('should return streak for consecutive days ending yesterday', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));

      const dates = [
         new Date('2024-03-14T10:00:00'),
         new Date('2024-03-13T10:00:00'),
      ];
      expect(calculateStreak(dates)).toBe(2);
   });

   it('should return 0 when most recent workout is older than yesterday', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));

      const dates = [
         new Date('2024-03-12T10:00:00'),
         new Date('2024-03-11T10:00:00'),
      ];
      expect(calculateStreak(dates)).toBe(0);
   });

   it('should break streak on gap', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));

      const dates = [
         new Date('2024-03-15T10:00:00'),
         new Date('2024-03-14T10:00:00'),
         // gap on 2024-03-13
         new Date('2024-03-12T10:00:00'),
      ];
      expect(calculateStreak(dates)).toBe(2);
   });

   it('should deduplicate same-day workouts', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-15T12:00:00'));

      const dates = [
         new Date('2024-03-15T10:00:00'),
         new Date('2024-03-15T18:00:00'),
         new Date('2024-03-14T10:00:00'),
      ];
      expect(calculateStreak(dates)).toBe(2);
   });
});
