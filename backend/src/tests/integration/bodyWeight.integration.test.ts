import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
   setupTestDb, teardownTestDb, cleanDb,
   getApp, createAuthenticatedUser,
} from './setup';

const app = getApp();

describe('Body Weight Integration', () => {
   let accessToken: string;

   beforeAll(async () => {
      await setupTestDb();
   });

   afterAll(async () => {
      await teardownTestDb();
   });

   beforeEach(async () => {
      await cleanDb();
      const auth = await createAuthenticatedUser();
      accessToken = auth.accessToken;
   });

   // ========== POST /body-weight ==========
   describe('POST /api/v1/body-weight', () => {
      it('should create a body weight entry', async () => {
         const res = await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 80.5 })
            .expect(201);

         expect(res.body.success).toBe(true);
         expect(res.body.data.weight).toBe(80.5);
         expect(res.body.data.id).toBeDefined();
      });

      it('should create a body weight entry with specific date', async () => {
         const res = await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 82, date: '2024-06-15T12:00:00.000Z' })
            .expect(201);

         expect(res.body.data.weight).toBe(82);
      });

      it('should return 400 with negative weight', async () => {
         await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: -5 })
            .expect(400);
      });

      it('should return 400 with zero weight', async () => {
         await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 0 })
            .expect(400);
      });

      it('should return 400 with missing weight', async () => {
         await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({})
            .expect(400);
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .post('/api/v1/body-weight')
            .send({ weight: 80 })
            .expect(401);
      });
   });

   // ========== GET /body-weight ==========
   describe('GET /api/v1/body-weight', () => {
      it('should return paginated body weight entries', async () => {
         for (let i = 0; i < 3; i++) {
            await request(app)
               .post('/api/v1/body-weight')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({ weight: 80 + i })
               .expect(201);
         }

         const res = await request(app)
            .get('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(3);
         expect(res.body.pagination).toBeDefined();
      });

      it('should respect pagination params', async () => {
         for (let i = 0; i < 5; i++) {
            await request(app)
               .post('/api/v1/body-weight')
               .set('Authorization', `Bearer ${accessToken}`)
               .send({ weight: 80 + i })
               .expect(201);
         }

         const res = await request(app)
            .get('/api/v1/body-weight')
            .query({ page: 1, limit: 2 })
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(2);
         expect(res.body.pagination.totalPages).toBe(3);
      });

      it('should only return entries for the authenticated user', async () => {
         await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 80 })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });
         const res = await request(app)
            .get('/api/v1/body-weight')
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(200);

         expect(res.body.data.length).toBe(0);
      });
   });

   // ========== DELETE /body-weight/:id ==========
   describe('DELETE /api/v1/body-weight/:id', () => {
      it('should delete a body weight entry', async () => {
         const createRes = await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 80 })
            .expect(201);

         await request(app)
            .delete(`/api/v1/body-weight/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         // Verify it's gone
         const listRes = await request(app)
            .get('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(listRes.body.data.length).toBe(0);
      });

      it('should return 404 for non-existent entry', async () => {
         await request(app)
            .delete('/api/v1/body-weight/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
      });

      it('should return 403 when deleting another user entry', async () => {
         const createRes = await request(app)
            .post('/api/v1/body-weight')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ weight: 80 })
            .expect(201);

         const user2 = await createAuthenticatedUser({ email: 'u2@test.com', username: 'user2' });

         await request(app)
            .delete(`/api/v1/body-weight/${createRes.body.data.id}`)
            .set('Authorization', `Bearer ${user2.accessToken}`)
            .expect(403);
      });
   });
});
