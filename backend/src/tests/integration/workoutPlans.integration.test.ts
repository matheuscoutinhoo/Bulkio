import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
   setupTestDb, teardownTestDb, cleanDb, seedExercises,
   getApp, createAuthenticatedUser, generateToken,
} from './setup';

const app = getApp();

describe('Workout Plans Integration', () => {
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

   // ========== POST /workouts ==========
   describe('POST /api/v1/workouts', () => {
      it('should create a workout plan', async () => {
         const res = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Push Day' })
            .expect(201);

         expect(res.body.success).toBe(true);
         expect(res.body.data.name).toBe('Push Day');
         expect(res.body.data.id).toBeDefined();
      });

      it('should create a workout plan with exercises', async () => {
         const res = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               name: 'Chest Day',
               exercises: [
                  { exerciseId: exercises[0].id, sets: 4, reps: '8-12', restSeconds: 90, order: 0 },
               ],
            })
            .expect(201);

         expect(res.body.data.name).toBe('Chest Day');
         expect(res.body.data.exercises.length).toBe(1);
      });

      it('should return 400 when name is missing', async () => {
         await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({})
            .expect(400);
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .post('/api/v1/workouts')
            .send({ name: 'No Auth' })
            .expect(401);
      });
   });

   // ========== GET /workouts ==========
   describe('GET /api/v1/workouts', () => {
      it('should return only plans belonging to the authenticated user', async () => {
         // Create plan for user1
         await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'User1 Plan' })
            .expect(201);

         // Create another user
         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });
         await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .send({ name: 'User2 Plan' })
            .expect(201);

         // User1 should only see their plan
         const res = await request(app)
            .get('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(1);
         expect(res.body.data[0].name).toBe('User1 Plan');
      });

      it('should exclude archived plans by default', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'To Archive' })
            .expect(201);

         // Archive it
         await request(app)
            .delete(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         const res = await request(app)
            .get('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(0);
      });
   });

   // ========== GET /workouts/:id ==========
   describe('GET /api/v1/workouts/:id', () => {
      it('should return a workout plan with exercises', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               name: 'Full Plan',
               exercises: [
                  { exerciseId: exercises[0].id, sets: 3, reps: '10', restSeconds: 60, order: 0 },
               ],
            })
            .expect(201);

         const res = await request(app)
            .get(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.name).toBe('Full Plan');
         expect(res.body.data.exercises.length).toBe(1);
      });

      it('should return 404 for non-existent plan', async () => {
         await request(app)
            .get('/api/v1/workouts/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
      });

      it('should return 403 when accessing another user plan', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Private Plan' })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         await request(app)
            .get(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(403);
      });
   });

   // ========== PATCH /workouts/:id ==========
   describe('PATCH /api/v1/workouts/:id', () => {
      it('should update a workout plan name', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Old Name' })
            .expect(201);

         const res = await request(app)
            .patch(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'New Name' })
            .expect(200);

         expect(res.body.data.name).toBe('New Name');
      });

      it('should replace exercises when provided', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               name: 'Update Exercises',
               exercises: [
                  { exerciseId: exercises[0].id, sets: 3, reps: '10', restSeconds: 60, order: 0 },
               ],
            })
            .expect(201);

         const res = await request(app)
            .patch(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               exercises: [
                  { exerciseId: exercises[1].id, sets: 5, reps: '5', restSeconds: 120, order: 0 },
                  { exerciseId: exercises[2].id, sets: 4, reps: '8', restSeconds: 90, order: 1 },
               ],
            })
            .expect(200);

         expect(res.body.data.exercises.length).toBe(2);
      });

      it('should return 403 when updating another user plan', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Not Yours' })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         await request(app)
            .patch(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .send({ name: 'Stolen' })
            .expect(403);
      });
   });

   // ========== POST /workouts/:id/duplicate ==========
   describe('POST /api/v1/workouts/:id/duplicate', () => {
      it('should duplicate a workout plan', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
               name: 'Original',
               exercises: [
                  { exerciseId: exercises[0].id, sets: 3, reps: '10', restSeconds: 60, order: 0 },
               ],
            })
            .expect(201);

         const res = await request(app)
            .post(`/api/v1/workouts/${createRes.body.data.id}/duplicate`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201);

         expect(res.body.data.name).toContain('Original');
         expect(res.body.data.id).not.toBe(createRes.body.data.id);
         expect(res.body.data.exercises.length).toBe(1);
      });

      it('should return 404 when duplicating non-existent plan', async () => {
         await request(app)
            .post('/api/v1/workouts/00000000-0000-0000-0000-000000000000/duplicate')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
      });

      it('should return 403 when duplicating another user plan', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Not Yours' })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         await request(app)
            .post(`/api/v1/workouts/${createRes.body.data.id}/duplicate`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(403);
      });
   });

   // ========== GET /workouts with includeArchived ==========
   describe('GET /api/v1/workouts (includeArchived)', () => {
      it('should return archived plans when includeArchived=true', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Will Archive' })
            .expect(201);

         // Archive
         await request(app)
            .delete(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         // Without includeArchived
         const res1 = await request(app)
            .get('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
         expect(res1.body.data.length).toBe(0);

         // With includeArchived=true
         const res2 = await request(app)
            .get('/api/v1/workouts?includeArchived=true')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
         expect(res2.body.data.length).toBe(1);
         expect(res2.body.data[0].isArchived).toBe(true);
      });
   });

   // ========== PATCH /workouts/:id (additional) ==========
   describe('PATCH /api/v1/workouts/:id (additional)', () => {
      it('should return 404 when updating non-existent plan', async () => {
         await request(app)
            .patch('/api/v1/workouts/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Ghost' })
            .expect(404);
      });
   });

   // ========== DELETE /workouts/:id (archive) ==========
   describe('DELETE /api/v1/workouts/:id', () => {
      it('should archive a workout plan (soft delete)', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'To Archive' })
            .expect(201);

         const res = await request(app)
            .delete(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(res.body.message).toContain('archived');
      });

      it('should return 403 when archiving another user plan', async () => {
         const createRes = await request(app)
            .post('/api/v1/workouts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Not Yours' })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         await request(app)
            .delete(`/api/v1/workouts/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(403);
      });
   });
});
