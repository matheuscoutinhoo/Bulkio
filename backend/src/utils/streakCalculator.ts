import { formatInTimeZone } from 'date-fns-tz';

const MS_PER_DAY = 86400000;

export function calculateStreak(workoutDates: Date[], timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): number {
   if (workoutDates.length === 0) return 0;

   const calendarDay = (date: Date) => Date.parse(formatInTimeZone(date, timeZone, 'yyyy-MM-dd'));
   const uniqueDates = [...new Set(workoutDates.map(calendarDay))].sort((first, second) => second - first);
   let anchor = calendarDay(new Date());
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
