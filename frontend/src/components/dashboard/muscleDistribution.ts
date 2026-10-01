import { muscleGroupLabels } from '@/lib/exerciseLabels';

export const BODY_MUSCLE_GROUPS = [
   'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS',
   'ABS', 'TRAPS', 'GLUTES', 'LEGS', 'CALVES',
] as const;

export const MUSCLE_COLORS = ['#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'];
export const UNTRAINED_COLOR = '#b7b4c3';

export function getMuscleColor(sets: number, maximum: number): string {
   if (sets <= 0 || maximum <= 0) return UNTRAINED_COLOR;
   const ratio = Math.min(1, sets / maximum);
   return MUSCLE_COLORS[Math.min(MUSCLE_COLORS.length - 1, Math.floor(ratio * MUSCLE_COLORS.length))];
}

export function getMuscleDistribution(distribution: Record<string, number>) {
   const setsByGroup = Object.fromEntries(Object.entries(distribution)
      .filter(([, sets]) => Number.isFinite(sets) && sets > 0));
   const total = Object.values(setsByGroup).reduce((sum, sets) => sum + sets, 0);
   // Cardio and full-body have no anatomical region in the API. Do not invent
   // per-muscle counts or let those categories flatten the body's colour scale.
   const maximum = Math.max(0, ...BODY_MUSCLE_GROUPS.map(group => setsByGroup[group] || 0));
   const entries = [...new Set([...BODY_MUSCLE_GROUPS, ...Object.keys(setsByGroup)])]
      .map(group => {
         const sets = setsByGroup[group] || 0;
         const mapped = (BODY_MUSCLE_GROUPS as readonly string[]).includes(group);
         return {
            group, name: muscleGroupLabels[group] || group, sets, mapped,
            percent: total > 0 ? Math.round(sets / total * 100) : 0,
            color: mapped ? getMuscleColor(sets, maximum) : UNTRAINED_COLOR,
         };
      })
      .sort((a, b) => b.sets - a.sets);
   return { entries, total, maximum };
}

export type MuscleEntry = ReturnType<typeof getMuscleDistribution>['entries'][number];
