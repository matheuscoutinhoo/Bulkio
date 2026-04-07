import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
   setupTestDb, teardownTestDb, cleanDb, seedExercises,
   getApp, createAuthenticatedUser,
} from './setup';

const app = getApp();

describe('Exercises Integration', () => {
   let accessToken: string;
   let exercises: { id: string; name: string; muscleGroup: string }[];

   beforeAll(async () => {
      await setupTestDb();
      exercises = await seedExercises() as any;
   });

   afterAll(async () => {
      await teardownTestDb();
   });

   beforeEach(async () => {
      await cleanDb();
      const auth = await createAuthenticatedUser();
      accessToken = auth.accessToken;
   });

   // ========== GET /exercises ==========
   describe('GET /api/v1/exercises', () => {
      it('should return paginated list of exercises', async () => {
         const res = await request(app)
            .get('/api/v1/exercises')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(Array.isArray(res.body.data)).toBe(true);
         expect(res.body.data.length).toBeGreaterThan(0);
         expect(res.body.pagination).toBeDefined();
      });

      it('should filter exercises by muscleGroup', async () => {
         const res = await request(app)
            .get('/api/v1/exercises?muscleGroup=CHEST')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.every((e: any) => e.muscleGroup === 'CHEST')).toBe(true);
      });

      it('should filter exercises by search term', async () => {
         const res = await request(app)
            .get('/api/v1/exercises?search=supino')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBeGreaterThan(0);
      });

      it('should respect pagination params', async () => {
         const res = await request(app)
            .get('/api/v1/exercises?page=1&limit=2')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBeLessThanOrEqual(2);
         expect(res.body.pagination.limit).toBe(2);
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .get('/api/v1/exercises')
            .expect(401);
      });
   });

   // ========== GET /exercises/muscle-groups ==========
   describe('GET /api/v1/exercises/muscle-groups', () => {
      it('should return list of unique muscle groups', async () => {
         const res = await request(app)
            .get('/api/v1/exercises/muscle-groups')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(Array.isArray(res.body.data)).toBe(true);
         expect(res.body.data).toContain('CHEST');
      });
   });

   // ========== GET /exercises/:id ==========
   describe('GET /api/v1/exercises/:id', () => {
      it('should return a single exercise by ID', async () => {
         const exerciseId = exercises[0].id;

         const res = await request(app)
            .get(`/api/v1/exercises/${exerciseId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.id).toBe(exerciseId);
         expect(res.body.data.name).toBe(exercises[0].name);
      });

      it('should return 404 for non-existent exercise', async () => {
         const res = await request(app)
            .get('/api/v1/exercises/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);

         expect(res.body.success).toBe(false);
      });
   });
});
