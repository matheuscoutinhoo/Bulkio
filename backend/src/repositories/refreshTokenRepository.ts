import prisma from '../config/database';

export const refreshTokenRepository = {
   create(tokenHash: string, userId: string, expiresAt: Date) {
      return prisma.refreshToken.create({
         data: { tokenHash, userId, expiresAt },
      });
   },

   findByHash(tokenHash: string) {
      return prisma.refreshToken.findUnique({
         where: { tokenHash },
      });
   },

   deleteByHash(tokenHash: string) {
      return prisma.refreshToken.delete({
         where: { tokenHash },
      }).catch(() => null); // Ignore if already deleted
   },

   deleteAllByUser(userId: string) {
      return prisma.refreshToken.deleteMany({
         where: { userId },
      });
   },
};
