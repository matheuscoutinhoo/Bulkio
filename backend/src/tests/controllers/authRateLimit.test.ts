import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../controllers/authController', () => {
   const handler = (_req: express.Request, res: express.Response) => res.sendStatus(200);
   return {
      authController: {
         register: handler,
         login: handler,
         refresh: handler,
         logout: handler,
         getProfile: handler,
         updateProfile: handler,
         deleteAccount: handler,
      },
   };
});

describe('authentication rate limits', () => {
   afterEach(() => {
      vi.unstubAllEnvs();
   });

   it('keeps repeated session renewals separate from login attempts', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const { default: router } = await import('../../routes/auth');
      const app = express();
      app.use(express.json());
      app.use('/auth', router);

      for (let attempt = 0; attempt < 12; attempt++) {
         expect((await request(app).post('/auth/refresh')).status).toBe(200);
      }

      const login = () => request(app).post('/auth/login').send({
         email: 'test@example.com', password: 'password123',
      });
      for (let attempt = 0; attempt < 10; attempt++) {
         expect((await login()).status).toBe(200);
      }
      expect((await login()).status).toBe(429);
      expect((await request(app).post('/auth/refresh')).status).toBe(200);
   });
});