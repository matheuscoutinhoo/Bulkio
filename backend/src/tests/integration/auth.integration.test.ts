import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
   setupTestDb, teardownTestDb, cleanDb,
   getApp, createAuthenticatedUser,
} from './setup';

const app = getApp();

describe('Auth Integration', () => {
   beforeAll(async () => {
      await setupTestDb();
   });

   afterAll(async () => {
      await teardownTestDb();
   });

   beforeEach(async () => {
      await cleanDb();
   });

   // ========== POST /auth/register ==========
   describe('POST /api/v1/auth/register', () => {
      it('should register a new user and return 201', async () => {
         const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ email: 'new@test.com', username: 'newuser', password: 'Password123' })
            .expect(201);

         expect(res.body.success).toBe(true);
         expect(res.body.data.user).toHaveProperty('id');
         expect(res.body.data.user.email).toBe('new@test.com');
         expect(res.body.data.user.username).toBe('newuser');
         expect(res.body.data.accessToken).toBeDefined();
         expect(res.body.data.user).not.toHaveProperty('password');

         // refreshToken should be in httpOnly cookie, NOT in body
         const cookies = res.headers['set-cookie'];
         expect(cookies).toBeDefined();
         const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
         expect(refreshCookie).toBeDefined();
         expect(refreshCookie).toContain('HttpOnly');
      });

      it('should return 409 when email is already registered', async () => {
         await createAuthenticatedUser({ email: 'dup@test.com', username: 'user1' });

         const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ email: 'dup@test.com', username: 'user2', password: 'Password123' })
            .expect(409);

         expect(res.body.success).toBe(false);
         expect(res.body.message).toContain('Email already registered');
      });

      it('should return 409 when username is already taken', async () => {
         await createAuthenticatedUser({ email: 'first@test.com', username: 'taken' });

         const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ email: 'second@test.com', username: 'taken', password: 'Password123' })
            .expect(409);

         expect(res.body.success).toBe(false);
         expect(res.body.message).toContain('Username already taken');
      });

      it('should return 400 for invalid email format', async () => {
         const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ email: 'not-an-email', username: 'validuser', password: 'Password123' })
            .expect(400);

         expect(res.body.success).toBe(false);
      });

      it('should return 400 when password is too short', async () => {
         const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ email: 'ok@test.com', username: 'validuser', password: 'short' })
            .expect(400);

         expect(res.body.success).toBe(false);
      });

      it('should return 400 when username has invalid characters', async () => {
         const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ email: 'ok@test.com', username: 'bad user!', password: 'Password123' })
            .expect(400);

         expect(res.body.success).toBe(false);
      });
   });

   // ========== POST /auth/login ==========
   describe('POST /api/v1/auth/login', () => {
      it('should login with valid credentials and return tokens', async () => {
         await createAuthenticatedUser({ email: 'login@test.com', username: 'loginuser', password: 'MyPassword1' });

         const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'login@test.com', password: 'MyPassword1' })
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(res.body.data.accessToken).toBeDefined();
         expect(res.body.data.user.email).toBe('login@test.com');
         expect(res.body.data.user).not.toHaveProperty('password');
      });

      it('should return 401 for wrong password', async () => {
         await createAuthenticatedUser({ email: 'pw@test.com', username: 'pwuser' });

         const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'pw@test.com', password: 'WrongPassword' })
            .expect(401);

         expect(res.body.success).toBe(false);
      });

      it('should return 401 for non-existent email', async () => {
         const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'ghost@test.com', password: 'Password123' })
            .expect(401);

         expect(res.body.success).toBe(false);
      });

      it('should return 400 for missing password', async () => {
         const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@test.com' })
            .expect(400);

         expect(res.body.success).toBe(false);
      });
   });

   // ========== POST /auth/refresh ==========
   describe('POST /api/v1/auth/refresh', () => {
      it('should issue new tokens with valid refresh token', async () => {
         const { refreshToken } = await createAuthenticatedUser();

         const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200);

         expect(res.body.data.accessToken).toBeDefined();
         const cookies = res.headers['set-cookie'];
         const newRefreshCookie = cookies?.find((c: string) => c.startsWith('refreshToken='));
         expect(newRefreshCookie).toBeDefined();
      });

      it('should return 401 when no refresh token cookie', async () => {
         const res = await request(app)
            .post('/api/v1/auth/refresh')
            .expect(401);

         expect(res.body.success).toBe(false);
      });

      it('should return 401 for invalid refresh token', async () => {
         const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', 'refreshToken=invalid-token')
            .expect(401);

         expect(res.body.success).toBe(false);
      });

      it('should invalidate old refresh token after rotation', async () => {
         const { refreshToken } = await createAuthenticatedUser();

         // First refresh — should succeed
         await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200);

         // Reuse old token — should fail (already rotated)
         const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(401);

         expect(res.body.success).toBe(false);
      });
   });

   // ========== POST /auth/logout ==========
   describe('POST /api/v1/auth/logout', () => {
      it('should clear the refresh token cookie', async () => {
         const { refreshToken } = await createAuthenticatedUser();

         const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200);

         expect(res.body.success).toBe(true);
         const cookies = res.headers['set-cookie'];
         const cleared = cookies?.find((c: string) => c.startsWith('refreshToken='));
         expect(cleared).toBeDefined();
      });

      it('should succeed even without a refresh token', async () => {
         const res = await request(app)
            .post('/api/v1/auth/logout')
            .expect(200);

         expect(res.body.success).toBe(true);
      });

      it('should invalidate the refresh token so it cannot be reused', async () => {
         const { refreshToken } = await createAuthenticatedUser();

         await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(200);

         // Try to refresh with logged out token
         const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', `refreshToken=${refreshToken}`)
            .expect(401);

         expect(res.body.success).toBe(false);
      });
   });

   // ========== GET /auth/profile ==========
   describe('GET /api/v1/auth/profile', () => {
      it('should return the authenticated user profile', async () => {
         const { accessToken, user } = await createAuthenticatedUser();

         const res = await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.data.id).toBe(user.id);
         expect(res.body.data.email).toBe(user.email);
         expect(res.body.data).not.toHaveProperty('password');
      });

      it('should return 401 without auth token', async () => {
         await request(app)
            .get('/api/v1/auth/profile')
            .expect(401);
      });

      it('should return 401 with invalid auth token', async () => {
         await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
      });
   });

   // ========== PATCH /auth/profile ==========
   describe('PATCH /api/v1/auth/profile', () => {
      it('should update username successfully', async () => {
         const { accessToken } = await createAuthenticatedUser();

         const res = await request(app)
            .patch('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'newname' })
            .expect(200);

         expect(res.body.data.username).toBe('newname');
      });

      it('should update goal successfully', async () => {
         const { accessToken } = await createAuthenticatedUser();

         const res = await request(app)
            .patch('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ goal: 'BULK' })
            .expect(200);

         expect(res.body.data.goal).toBe('BULK');
      });

      it('should return 409 when username is taken by another user', async () => {
         await createAuthenticatedUser({ email: 'u1@test.com', username: 'owner' });
         const { accessToken } = await createAuthenticatedUser({ email: 'u2@test.com', username: 'other' });

         const res = await request(app)
            .patch('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'owner' })
            .expect(409);

         expect(res.body.message).toContain('Username already taken');
      });

      it('should allow setting username to own current username', async () => {
         const { accessToken } = await createAuthenticatedUser({ username: 'samename' });

         await request(app)
            .patch('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'samename' })
            .expect(200);
      });

      it('should return 400 for invalid username format', async () => {
         const { accessToken } = await createAuthenticatedUser();

         await request(app)
            .patch('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ username: 'ab' }) // too short
            .expect(400);
      });
   });

   // ========== DELETE /auth/account ==========
   describe('DELETE /api/v1/auth/account', () => {
      it('should delete user account and all associated data', async () => {
         const { accessToken, user } = await createAuthenticatedUser();

         const res = await request(app)
            .delete('/api/v1/auth/account')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(res.body.message).toBe('Account deleted');

         // Verify user is gone — profile should fail
         await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(401);
      });

      it('should return 401 without auth', async () => {
         await request(app)
            .delete('/api/v1/auth/account')
            .expect(401);
      });
   });

   // ========== GET /health ==========
   describe('GET /api/health', () => {
      it('should return health status', async () => {
         const res = await request(app)
            .get('/api/health')
            .expect(200);

         expect(res.body.success).toBe(true);
         expect(res.body.data.status).toBe('ok');
      });
   });
});
