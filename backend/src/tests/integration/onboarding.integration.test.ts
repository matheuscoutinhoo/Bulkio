import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, cleanDb, getApp, createAuthenticatedUser } from './setup';

const app = getApp();
const data = { height: 176, weight: 75.5, goal: 'MAINTAIN', targetWeight: null };

describe('Onboarding Integration', () => {
   beforeAll(setupTestDb);
   afterAll(teardownTestDb);
   beforeEach(cleanDb);

   it('saves one measurement when two completions arrive concurrently', async () => {
      const auth = await createAuthenticatedUser();
      expect(auth.user.onboardingStatus).toBe('PENDING');
      const complete = () => request(app).post('/api/v1/auth/onboarding').set('Authorization', `Bearer ${auth.accessToken}`).send(data).expect(200);
      const responses = await Promise.all([complete(), complete()]);
      expect(responses.every(response => response.body.data.onboardingStatus === 'COMPLETED')).toBe(true);
      const weights = await request(app).get('/api/v1/body-weight').set('Authorization', `Bearer ${auth.accessToken}`).expect(200);
      expect(weights.body.data).toHaveLength(1);
      expect(weights.body.data[0].weight).toBe(75.5);
   });

   it('preserves registered weights and derives the baseline from existing history', async () => {
      const auth = await createAuthenticatedUser();
      const headers = { Authorization: `Bearer ${auth.accessToken}` };
      await request(app).post('/api/v1/body-weight').set(headers).send({ weight: 84, date: '2025-01-01T12:00:00Z' }).expect(201);
      await request(app).post('/api/v1/body-weight').set(headers).send({ weight: 80, date: '2026-01-01T12:00:00Z' }).expect(201);
      const response = await request(app).post('/api/v1/auth/onboarding').set(headers).send({ ...data, weight: 80 }).expect(200);
      expect(response.body.data.initialWeight).toBe(84);
      const weights = await request(app).get('/api/v1/body-weight').set(headers).expect(200);
      expect(weights.body.data).toHaveLength(2);
   });

   it('can defer setup without creating measurements and complete it later', async () => {
      const auth = await createAuthenticatedUser();
      const headers = { Authorization: `Bearer ${auth.accessToken}` };
      const skipped = await request(app).post('/api/v1/auth/onboarding/skip').set(headers).expect(200);
      expect(skipped.body.data.onboardingStatus).toBe('SKIPPED');
      expect((await request(app).get('/api/v1/body-weight').set(headers)).body.data).toHaveLength(0);
      await request(app).post('/api/v1/auth/onboarding').set(headers).send(data).expect(200);
      const completed = await request(app).post('/api/v1/auth/onboarding/skip').set(headers).expect(200);
      expect(completed.body.data.onboardingStatus).toBe('COMPLETED');
   });
});
