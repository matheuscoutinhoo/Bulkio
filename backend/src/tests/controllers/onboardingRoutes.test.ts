import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { errorHandler } from '../../middlewares/errorHandler';
vi.mock('../../services/authService', () => ({ authService: { completeOnboarding: vi.fn(), skipOnboarding: vi.fn() } }));
import router from '../../routes/auth';
import { authService } from '../../services/authService';

const app = express();
app.use(express.json()); app.use('/auth', router); app.use(errorHandler);
const token = jwt.sign({ userId: 'setup-user', email: 'new@example.test' }, config.jwtSecret, { expiresIn: '5m' });
const input = { height: 176, weight: 75.5, goal: 'MAINTAIN', targetWeight: null };

beforeEach(() => vi.clearAllMocks());

describe('onboarding routes', () => {
   it('requires authentication for completing or deferring setup', async () => {
      expect((await request(app).post('/auth/onboarding').send(input)).status).toBe(401);
      expect((await request(app).post('/auth/onboarding/skip')).status).toBe(401);
      expect(authService.completeOnboarding).not.toHaveBeenCalled();
      expect(authService.skipOnboarding).not.toHaveBeenCalled();
   });

   it.each([{ height: 1.76 }, { weight: -10 }, { weight: '75,5' }, { goal: 'INVALID' }, { targetWeight: 501 }])('rejects invalid setup input %j before saving', async invalid => {
      const result = await request(app).post('/auth/onboarding').set('Authorization', `Bearer ${token}`).send({ ...input, ...invalid });
      expect(result.status).toBe(400);
      expect(authService.completeOnboarding).not.toHaveBeenCalled();
   });

   it('saves only for the authenticated account and accepts an optional target', async () => {
      vi.mocked(authService.completeOnboarding).mockResolvedValue({ id: 'setup-user', onboardingStatus: 'COMPLETED' } as never);
      const result = await request(app).post('/auth/onboarding').set('Authorization', `Bearer ${token}`).send({ ...input, userId: 'another-user' });
      expect(result.status).toBe(200);
      expect(authService.completeOnboarding).toHaveBeenCalledWith('setup-user', input);
      expect(result.body.data.onboardingStatus).toBe('COMPLETED');
   });

   it('allows deferring setup independently of its measurement fields', async () => {
      vi.mocked(authService.skipOnboarding).mockResolvedValue({ id: 'setup-user', onboardingStatus: 'SKIPPED' } as never);
      const result = await request(app).post('/auth/onboarding/skip').set('Authorization', `Bearer ${token}`).send({ userId: 'another-user' });
      expect(result.status).toBe(200);
      expect(authService.skipOnboarding).toHaveBeenCalledOnce();
      expect(authService.skipOnboarding).toHaveBeenCalledWith('setup-user');
   });
});
