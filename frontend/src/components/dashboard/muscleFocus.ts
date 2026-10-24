// Azimuth 0 faces the front; PI faces the back. Side views expose the arms.
const muscleViews: Record<string, { azimuth: number; targetY: number; zoom: number }> = {
   CHEST: { azimuth: 0, targetY: 0.35, zoom: 1.3 },
   BACK: { azimuth: Math.PI, targetY: 0.3, zoom: 1.3 },
   SHOULDERS: { azimuth: Math.PI / 6, targetY: 0.4, zoom: 1.25 },
   BICEPS: { azimuth: Math.PI / 7, targetY: 0.3, zoom: 1.25 },
   TRICEPS: { azimuth: Math.PI * 5 / 6, targetY: 0.3, zoom: 1.25 },
   FOREARMS: { azimuth: Math.PI / 10, targetY: 0.15, zoom: 1.1 },
   ABS: { azimuth: 0, targetY: 0.15, zoom: 1.4 },
   TRAPS: { azimuth: Math.PI, targetY: 0.4, zoom: 1.3 },
   GLUTES: { azimuth: Math.PI, targetY: -0.15, zoom: 1.4 },
   LEGS: { azimuth: 0, targetY: -0.35, zoom: 1.3 },
   CALVES: { azimuth: Math.PI, targetY: -0.55, zoom: 1.4 },
};

export function getMuscleFocus(group: string | null) {
   return group ? muscleViews[group] ?? null : null;
}
