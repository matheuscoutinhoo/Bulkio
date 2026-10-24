import prisma from '../config/database';

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
         select: {
            id: true,
            email: true,
            username: true,
            goal: true,
            initialWeight: true,
            targetWeight: true,
            height: true,
            createdAt: true,
            updatedAt: true,
         },
      });
   },

   create(data: { email: string; username: string; password: string }) {
      return prisma.user.create({ data });
   },

   update(id: string, data: Partial<{ username: string; goal: string | null; initialWeight: number | null; targetWeight: number | null; height: number | null }>) {
      return prisma.user.update({
         where: { id },
         data,
         select: {
            id: true,
            email: true,
            username: true,
            goal: true,
            initialWeight: true,
            targetWeight: true,
            height: true,
            createdAt: true,
            updatedAt: true,
         },
      });
   },

   delete(id: string) {
      return prisma.user.delete({ where: { id } });
   },
};
