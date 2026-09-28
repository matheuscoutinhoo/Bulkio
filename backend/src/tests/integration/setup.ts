import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { config } from '../../config';

const TEST_DB_URL = process.env.TEST_DATABASE_URL
   || process.env.DATABASE_URL
   || 'postgresql://bulkio:bulkio@localhost:5433/bulkio_test?schema=public';

let prisma: PrismaClient;

export function getTestPrisma() {
   return prisma;
}

export function getApp() {
   return app;
}

export async function setupTestDb() {
   process.env.DATABASE_URL = TEST_DB_URL;

   execSync('npx prisma migrate reset --force --skip-seed', {
      cwd: path.join(__dirname, '..', '..', '..'),
      env: { ...process.env, DATABASE_URL: TEST_DB_URL },
      stdio: 'pipe',
   });

   prisma = new PrismaClient({
      datasources: { db: { url: TEST_DB_URL } },
   });

   await prisma.$connect();
}

export async function teardownTestDb() {
   if (prisma) {
      await prisma.$disconnect();
   }
}

export async function cleanDb() {
   // Delete in order respecting foreign keys
   await prisma.workoutLogSet.deleteMany();
   await prisma.workoutLogExercise.deleteMany();
   await prisma.workoutLog.deleteMany();
   await prisma.workoutPlanExercise.deleteMany();
   await prisma.workoutPlan.deleteMany();
   await prisma.personalRecord.deleteMany();
   await prisma.bodyWeight.deleteMany();
   await prisma.refreshToken.deleteMany();
   await prisma.user.deleteMany();
   // Don't delete exercises — they're seeded globally
}

export async function seedExercises() {
   const exercises = [
      { name: 'Supino Reto com Barra', muscleGroup: 'CHEST', type: 'COMPOUND', equipment: 'BARBELL' },
      { name: 'Agachamento Livre', muscleGroup: 'LEGS', type: 'COMPOUND', equipment: 'BARBELL' },
      { name: 'Puxada Frontal', muscleGroup: 'BACK', type: 'COMPOUND', equipment: 'CABLE' },
      { name: 'Desenvolvimento com Halteres', muscleGroup: 'SHOULDERS', type: 'COMPOUND', equipment: 'DUMBBELL' },
      { name: 'Rosca Direta com Barra', muscleGroup: 'BICEPS', type: 'ISOLATED', equipment: 'BARBELL' },
   ];

   for (const ex of exercises) {
      await prisma.exercise.upsert({
         where: { name: ex.name },
         update: {},
         create: ex,
      });
   }

   return prisma.exercise.findMany();
}

/**
 * Register a user and return tokens + user info.
 */
export async function createAuthenticatedUser(
   overrides: { email?: string; username?: string; password?: string } = {},
) {
   const data = {
      email: overrides.email || 'test@example.com',
      username: overrides.username || 'testuser',
      password: overrides.password || 'Password123',
   };

   const res = await request(app)
      .post('/api/v1/auth/register')
      .send(data)
      .expect(201);

   const accessToken = res.body.data.accessToken as string;
   const refreshToken = res.headers['set-cookie']
      ?.find((c: string) => c.startsWith('refreshToken='))
      ?.split(';')[0]
      ?.split('=')[1];

   return {
      user: res.body.data.user,
      accessToken,
      refreshToken: refreshToken || '',
      credentials: data,
   };
}

/**
 * Generate a valid JWT for a given userId (useful for testing ownership).
 */
export function generateToken(userId: string, email = 'test@example.com') {
   return jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: '15m' });
}
