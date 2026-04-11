import { personalRecordRepository } from '../repositories/personalRecordRepository';

export const personalRecordService = {
   async checkAndUpdate(userId: string, exerciseId: string, weight: number, reps: number, date?: Date) {
      if (weight <= 0) return;

      const currentPR = await personalRecordRepository.findByUserAndExercise(userId, exerciseId);

      if (!currentPR || weight > currentPR.weight || (weight === currentPR.weight && reps > currentPR.reps)) {
         await personalRecordRepository.upsert(userId, exerciseId, weight, reps, date ?? new Date());
      }
   },

   async updateFromExercises(
      userId: string,
      exercises: Array<{
         exerciseId: string;
         sets: Array<{ weight: number; reps: number }>;
      }>,
      logDate: Date,
   ) {
      const promises = exercises.flatMap((exercise) =>
         exercise.sets.map((set) =>
            this.checkAndUpdate(userId, exercise.exerciseId, set.weight, set.reps, logDate),
         ),
      );
      await Promise.all(promises);
   },
};
