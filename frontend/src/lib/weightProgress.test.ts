import { describe, expect, it } from 'vitest';
import { getWeightProgress } from './weightProgress';

describe('weight progress from recorded history', () => {
   it('uses the earliest recorded measurement even when a different initial weight was configured', () => {
      const result = getWeightProgress([{ weight: 80, date: '2026-10-24' }, { weight: 90, date: '2025-01-01' }], 80, 70);
      expect(result).toEqual({ baseline: 90, baselineDate: '2025-01-01', progress: 50 });
   });
   it('handles weight gain and clamps movement away from or beyond the target', () => {
      const history = (weight: number) => [{ weight: 70, date: '2025-01-01' }, { weight, date: '2026-10-24' }];
      expect(getWeightProgress(history(75), null, 80).progress).toBe(50);
      expect(getWeightProgress(history(65), null, 80).progress).toBe(0);
      expect(getWeightProgress(history(85), null, 80).progress).toBe(100);
   });
   it('does not invent progress without a measurement or a target', () => {
      expect(getWeightProgress([], 80, 70).progress).toBeNull();
      expect(getWeightProgress([{ weight: 80, date: '2026-01-01' }], null, null).progress).toBeNull();
   });
   it('handles a first measurement at the target without dividing by zero', () => {
      expect(getWeightProgress([{ weight: 80, date: '2026-01-01' }], null, 80).progress).toBe(100);
   });
   it('orders measurements with the same date by their registration time', () => {
      const result = getWeightProgress([
         { weight: 80, date: '2026-01-01', createdAt: '2026-01-01T18:00:00Z' },
         { weight: 90, date: '2026-01-01', createdAt: '2026-01-01T08:00:00Z' },
      ], null, 70);
      expect(result.baseline).toBe(90);
      expect(result.progress).toBe(50);
   });
});
