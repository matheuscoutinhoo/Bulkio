import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app';
import { config } from '../../config';

const TEST_DB_PATH = path.join(__dirname, '..', '..', '..', 'prisma', 'test.db');
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

let prisma: PrismaClient;

export function getTestPrisma() {
   return prisma;
}

export function getApp() {
   return app;
}

export async function setupTestDb() {
   // Remove old test DB if exists
   if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
   }
   // Also remove journal files
   const journalPath = TEST_DB_PATH + '-journal';
   if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
   }

   process.env.DATABASE_URL = TEST_DB_URL;

   // Push schema to create test DB
   execSync('npx prisma db push --skip-generate --accept-data-loss', {
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
   // Give SQLite time to release file locks
   await new Promise((resolve) => setTimeout(resolve, 200));
   try {
      if (fs.existsSync(TEST_DB_PATH)) {
         fs.unlinkSync(TEST_DB_PATH);
      }
      const journalPath = TEST_DB_PATH + '-journal';
      if (fs.existsSync(journalPath)) {
         fs.unlinkSync(journalPath);
      }
   } catch {
      // File may still be locked by another test suite — ignore
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
