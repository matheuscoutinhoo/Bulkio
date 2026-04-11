const MS_PER_DAY = 86400000;

export function calculateStreak(workoutDates: Date[]): number {
   if (workoutDates.length === 0) return 0;

   const today = new Date();
   today.setHours(0, 0, 0, 0);

   const uniqueDates: number[] = [];
   for (const date of workoutDates) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const t = d.getTime();
      if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1] !== t) {
         uniqueDates.push(t);
      }
   }

   let anchor = today.getTime();
   if (uniqueDates[0] !== anchor) {
      const yesterday = anchor - MS_PER_DAY;
      if (uniqueDates[0] === yesterday) {
         anchor = yesterday;
      } else {
         return 0;
      }
   }

   let streak = 0;
   for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === anchor - i * MS_PER_DAY) {
         streak++;
      } else {
         break;
      }
   }

   return streak;
}
