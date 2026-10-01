import { describe, expect, it } from 'vitest';
import { BODY_MUSCLE_GROUPS, getMuscleColor, getMuscleDistribution, MUSCLE_COLORS, UNTRAINED_COLOR } from './muscleDistribution';

describe('muscle distribution for the body map', () => {
   it('keeps absent muscles neutral and uses actual counts before rounding percentages', () => {
      const { entries, total } = getMuscleDistribution({ CHEST: 1000, BACK: 1 });
      expect(total).toBe(1001);
      expect(entries.find(entry => entry.group === 'BACK')).toMatchObject({ sets: 1, percent: 0, color: MUSCLE_COLORS[0] });
      expect(entries.find(entry => entry.group === 'CALVES')).toMatchObject({ sets: 0, color: UNTRAINED_COLOR });
      expect(entries[0]).toMatchObject({ group: 'CHEST', color: MUSCLE_COLORS.at(-1) });
   });

   it('makes stronger training darker and gives equal counts equal colours', () => {
      const values = [1, 10, 20, 30, 40, 50, 60, 70, 80].map(sets => getMuscleColor(sets, 80));
      const indexes = values.map(color => MUSCLE_COLORS.indexOf(color));
      expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
      expect(getMuscleColor(80, 80)).toBe(MUSCLE_COLORS.at(-1));
      const { entries } = getMuscleDistribution({ BICEPS: 12, TRICEPS: 12 });
      expect(entries.find(entry => entry.group === 'BICEPS')?.color).toBe(entries.find(entry => entry.group === 'TRICEPS')?.color);
   });

   it('includes non-anatomical categories in totals without inventing muscle activity', () => {
      const { total, maximum, entries } = getMuscleDistribution({ CARDIO: 100, FULL_BODY: 20, CHEST: 5, CUSTOM: 10 });
      expect(total).toBe(135);
      expect(maximum).toBe(5);
      expect(entries.find(entry => entry.group === 'CHEST')?.color).toBe(MUSCLE_COLORS.at(-1));
      expect(entries.find(entry => entry.group === 'CUSTOM')).toMatchObject({ sets: 10, mapped: false, color: UNTRAINED_COLOR });
      expect(entries.find(entry => entry.group === 'LEGS')?.sets).toBe(0);
   });

   it('handles empty and invalid data without NaN or false activity', () => {
      const { entries, total, maximum } = getMuscleDistribution({ CHEST: -2, BACK: NaN, ABS: Infinity });
      expect(total).toBe(0);
      expect(maximum).toBe(0);
      expect(entries).toHaveLength(BODY_MUSCLE_GROUPS.length);
      expect(entries.every(entry => entry.sets === 0 && entry.percent === 0 && entry.color === UNTRAINED_COLOR)).toBe(true);
   });
});
