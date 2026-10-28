import prisma from '../config/database';
import type { CompleteOnboardingInput } from '../models/schemas';

const profileFields = {
   id: true, email: true, username: true, goal: true, initialWeight: true,
   targetWeight: true, height: true, onboardingStatus: true, createdAt: true, updatedAt: true,
} as const;

export const userRepository = {
   findCredentialsById(id: string) {
      return prisma.user.findUnique({ where: { id }, select: { id: true, password: true } });
   },

   changePassword(id: string, previousHash: string, password: string) {
      return prisma.$transaction(async (tx) => {
         const result = await tx.user.updateMany({ where: { id, password: previousHash }, data: { password } });
         if (result.count === 1) await tx.refreshToken.deleteMany({ where: { userId: id } });
         return result.count === 1;
      });
   },

   findByEmail(email: string) {
      return prisma.user.findUnique({
         where: { email },
         select: {
            id: true,
            email: true,
            username: true,
            password: true,
            goal: true,
            initialWeight: true,
            targetWeight: true,
            height: true,
            onboardingStatus: true,
            createdAt: true,
         },
      });
   },

   findByUsername(username: string) {
      return prisma.user.findUnique({
         where: { username },
         select: {
            id: true,
            username: true,
         },
      });
   },

   findById(id: string) {
      return prisma.user.findUnique({
         where: { id },
         select: profileFields,
      });
   },

   create(data: { email: string; username: string; password: string }) {
      return prisma.user.create({ data });
   },

   update(id: string, data: Partial<{ username: string; goal: string | null; initialWeight: number | null; targetWeight: number | null; height: number | null }>) {
      return prisma.user.update({
         where: { id },
         data,
         select: profileFields,
      });
   },

   completeOnboarding(id: string, data: CompleteOnboardingInput) {
      return prisma.$transaction(async (tx) => {
         // Lock the user row before checking history so simultaneous completions
         // and retries cannot create multiple starting measurements.
         const profile = await tx.user.update({
            where: { id },
            data: { height: data.height, goal: data.goal, targetWeight: data.targetWeight ?? null, onboardingStatus: 'COMPLETED' },
            select: profileFields,
         });
         const firstWeight = await tx.bodyWeight.findFirst({
            where: { userId: id }, orderBy: [{ date: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
         });
         if (!firstWeight) await tx.bodyWeight.create({ data: { userId: id, weight: data.weight } });
         if (profile.initialWeight != null) return profile;
         return tx.user.update({
            where: { id }, data: { initialWeight: firstWeight?.weight ?? data.weight }, select: profileFields,
         });
      });
   },

   async skipOnboarding(id: string) {
      await prisma.user.updateMany({ where: { id, onboardingStatus: 'PENDING' }, data: { onboardingStatus: 'SKIPPED' } });
      return prisma.user.findUnique({ where: { id }, select: profileFields });
   },

   delete(id: string) {
      return prisma.user.delete({ where: { id } });
   },
};
