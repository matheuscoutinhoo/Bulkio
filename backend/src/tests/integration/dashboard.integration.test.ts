import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
   setupTestDb, teardownTestDb, cleanDb, seedExercises,
   getApp, createAuthenticatedUser,
} from './setup';

const app = getApp();

describe('Dashboard Integration', () => {
   let accessToken: string;
   let exercises: { id: string; name: string }[];

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

   // ========== GET /dashboard/stats ==========
   describe('GET /api/v1/dashboard/stats', () => {
      it('should return stats with zero data for a new user', async () => {
         const res = await request(app)
            .get('/api/v1/dashboard/stats')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(res.body.data.weeklyWorkouts).toBeDefined();
         expect(res.body.data.streak).toBe(0);
         expect(res.body.data.totalVolume).toBe(0);
         expect(res.body.data.personalRecords).toEqual([]);
         expect(res.body.data.muscleDistribution).toEqual({});
      });

      it('should return stats reflecting workout data', async () => {
         // Create a workout log for today
         await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [
                        { setNumber: 1, reps: 10, weight: 60 },
                        { setNumber: 2, reps: 8, weight: 70 },
                     ],
                  },
               ],
            })
            .expect(201);

         const res = await request(app)
            .get('/api/v1/dashboard/stats')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.weeklyWorkouts.current).toBeGreaterThanOrEqual(1);
         expect(res.body.data.totalVolume).toBeGreaterThan(0);
         expect(res.body.data.personalRecords.length).toBeGreaterThanOrEqual(1);
      });

      it('should include body weight data', async () => {
         await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 82.5 })
            .expect(201);

         const res = await request(app)
            .get('/api/v1/dashboard/stats')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.bodyWeight.current).toBeDefined();
         expect(res.body.data.bodyWeight.current.weight).toBe(82.5);
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .get('/api/v1/dashboard/stats')
            .expect(401);
      });
   });

   // ========== GET /dashboard/exercise-progression/:exerciseId ==========
   describe('GET /api/v1/dashboard/exercise-progression/:exerciseId', () => {
      it('should return empty array when no logs exist for exercise', async () => {
         const res = await request(app)
            .get(`/api/v1/dashboard/exercise-progression/${exercises[0].id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data).toEqual([]);
      });

      it('should return progression data for an exercise', async () => {
         // Create two workout logs with the same exercise
         for (let i = 0; i < 2; i++) {
            await request(app)
               .post('/api/v1/workout-logs')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({
                  exercises: [
                     {
                        exerciseId: exercises[0].id,
                        order: 0,
                        sets: [
                           { setNumber: 1, reps: 10, weight: 60 + i * 10 },
                        ],
                     },
                  ],
               })
               .expect(201);
         }

         const res = await request(app)
            .get(`/api/v1/dashboard/exercise-progression/${exercises[0].id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(2);
         expect(res.body.data[0].maxWeight).toBeDefined();
         expect(res.body.data[0].totalVolume).toBeDefined();
         expect(res.body.data[0].sets).toBeDefined();
      });

      it('should not return another user progression', async () => {
         await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 60 }],
                  },
               ],
            })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         const res = await request(app)
            .get(`/api/v1/dashboard/exercise-progression/${exercises[0].id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(200);

         expect(res.body.data).toEqual([]);
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .get(`/api/v1/dashboard/exercise-progression/${exercises[0].id}`)
            .expect(401);
      });
   });
});
