import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
   setupTestDb, teardownTestDb, cleanDb, seedExercises,
   getApp, createAuthenticatedUser,
} from './setup';

const app = getApp();

describe('Workout Logs Integration', () => {
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

   // ========== POST /workout-logs ==========
   describe('POST /api/v1/workout-logs', () => {
      it('should create a workout log with exercises and sets', async () => {
         const res = await request(app)
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

         expect(res.body.success).toBe(true);
         expect(res.body.data.id).toBeDefined();
         expect(res.body.data.exercises.length).toBe(1);
      });

      it('should create a workout log linked to a plan', async () => {
         // First create a plan
         const planRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Linked Plan' })
            .expect(201);

         const res = await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               workoutPlanId: planRes.body.data.id,
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 60 }],
                  },
               ],
            })
            .expect(201);

         expect(res.body.data.workoutPlanId).toBe(planRes.body.data.id);
      });

      it('should return 400 with endTime before startTime', async () => {
         await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               startTime: '2024-06-15T11:00:00.000Z',
               endTime: '2024-06-15T10:00:00.000Z',
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 60 }],
                  },
               ],
            })
            .expect(400);
      });

      it('should create a workout log with empty exercises', async () => {
         const res = await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ exercises: [] })
            .expect(201);

         expect(res.body.data.id).toBeDefined();
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .post('/api/v1/workout-logs')
            .send({
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 60 }],
                  },
               ],
            })
            .expect(401);
      });

      it('should create personal records from workout log sets', async () => {
         await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 5, weight: 100 }],
                  },
               ],
            })
            .expect(201);

         // Check that dashboard stats include the PR
         const statsRes = await request(app)
            .get('/api/v1/dashboard/stats')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(statsRes.body.data.personalRecords.length).toBeGreaterThanOrEqual(1);
         const pr = statsRes.body.data.personalRecords.find(
            (r: any) => r.exerciseId === exercises[0].id,
         );
         expect(pr).toBeDefined();
         expect(pr.weight).toBe(100);
      });
   });

   // ========== GET /workout-logs ==========
   describe('GET /api/v1/workout-logs', () => {
      it('should return paginated workout logs', async () => {
         // Create two logs
         for (let i = 0; i < 2; i++) {
            await request(app)
               .post('/api/v1/workout-logs')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({
                  exercises: [
                     {
                        exerciseId: exercises[0].id,
                        order: 0,
                        sets: [{ setNumber: 1, reps: 10, weight: 50 + i * 10 }],
                     },
                  ],
               })
               .expect(201);
         }

         const res = await request(app)
            .get('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(2);
         expect(res.body.pagination).toBeDefined();
      });

      it('should filter by date range', async () => {
         await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               date: '2024-01-15T12:00:00.000Z',
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 60 }],
                  },
               ],
            })
            .expect(201);

         await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               date: '2024-06-15T12:00:00.000Z',
               exercises: [
                  {
                     exerciseId: exercises[1].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 60 }],
                  },
               ],
            })
            .expect(201);

         const res = await request(app)
            .get('/api/v1/workout-logs')
            .query({ startDate: '2024-06-01T00:00:00.000Z', endDate: '2024-06-30T23:59:59.999Z' })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(1);
      });

      it('should only return logs belonging to the authenticated user', async () => {
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
            .get('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(0);
      });
   });

   // ========== GET /workout-logs/:id ==========
   describe('GET /api/v1/workout-logs/:id', () => {
      it('should return a workout log with exercises and sets', async () => {
         const createRes = await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 80 }],
                  },
               ],
            })
            .expect(201);

         const res = await request(app)
            .get(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.id).toBe(createRes.body.data.id);
         expect(res.body.data.exercises.length).toBe(1);
      });

      it('should return 404 for non-existent log', async () => {
         await request(app)
            .get('/api/v1/workout-logs/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
      });

      it('should return 403 when accessing another user log', async () => {
         const createRes = await request(app)
            .post('/api/v1/workout-logs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               exercises: [
                  {
                     exerciseId: exercises[0].id,
                     order: 0,
                     sets: [{ setNumber: 1, reps: 10, weight: 80 }],
                  },
               ],
            })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         await request(app)
            .get(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(403);
      });
   });

   // ========== PATCH /workout-logs/:id ==========
   describe('PATCH /api/v1/workout-logs/:id', () => {
      it('should update a workout log', async () => {
         const createRes = await request(app)
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

         const res = await request(app)
            .patch(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ isComplete: true, notes: 'Good session' })
            .expect(200);

         expect(res.body.data.isComplete).toBe(true);
         expect(res.body.data.notes).toBe('Good session');
      });

      it('should return 403 when updating another user log', async () => {
         const createRes = await request(app)
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

         await request(app)
            .patch(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .send({ isComplete: true })
            .expect(403);
      });
   });

   // ========== DELETE /workout-logs/:id ==========
   describe('DELETE /api/v1/workout-logs/:id', () => {
      it('should delete a workout log', async () => {
         const createRes = await request(app)
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

         await request(app)
            .delete(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         // Verify it's gone
         await request(app)
            .get(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
      });

      it('should return 403 when deleting another user log', async () => {
         const createRes = await request(app)
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

         await request(app)
            .delete(`/api/v1/workout-logs/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(403);
      });
   });
});
