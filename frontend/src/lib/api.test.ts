import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import api from './api';

const auth = vi.hoisted(() => ({
   accessToken: null as string | null,
   isAuthenticated: true,
   setAccessToken: vi.fn(),
   logout: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({ useAuthStore: { getState: () => auth } }));

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200) {
   return { config, data, status, statusText: String(status), headers: {} };
}

function rejectRequest(config: InternalAxiosRequestConfig, status?: number) {
   return Promise.reject(new AxiosError('Request failed', 'ERR_TEST', config, undefined,
      status ? response(config, {}, status) : undefined));
}

describe('session renewal', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      auth.accessToken = null;
      auth.isAuthenticated = true;
      auth.setAccessToken.mockImplementation((token: string) => { auth.accessToken = token; });
      auth.logout.mockImplementation(() => { auth.accessToken = null; auth.isAuthenticated = false; });
      axios.defaults.adapter = vi.fn(async (config) => response(config, { data: { accessToken: 'renewed' } }));
      api.defaults.adapter = vi.fn(async (config) => response(config, { success: true }));
   });

   it('restores a reload session once before concurrent protected requests', async () => {
      const requestAdapter = vi.fn(async (config: InternalAxiosRequestConfig) => response(config, { success: true }));
      api.defaults.adapter = requestAdapter;
      await Promise.all([api.get('/dashboard/stats'), api.get('/workouts'), api.get('/auth/profile')]);

      expect(axios.defaults.adapter).toHaveBeenCalledTimes(1);
      expect(axios.defaults.adapter).toHaveBeenCalledWith(expect.objectContaining({ withCredentials: true }));
      expect(api.defaults.adapter).toHaveBeenCalledTimes(3);
      for (const [config] of requestAdapter.mock.calls) {
         expect(config.headers.Authorization).toBe('Bearer renewed');
      }
      expect(auth.logout).not.toHaveBeenCalled();
   });

   it('renews an expired token once for concurrent unauthorized requests', async () => {
      auth.accessToken = 'expired';
      api.defaults.adapter = vi.fn((config) => config.headers.Authorization === 'Bearer expired'
         ? rejectRequest(config, 401)
         : Promise.resolve(response(config, {})));

      await Promise.all([api.get('/dashboard/stats'), api.get('/workouts')]);

      expect(axios.defaults.adapter).toHaveBeenCalledTimes(1);
      expect(api.defaults.adapter).toHaveBeenCalledTimes(4);
   });

   it.each([429, 500, undefined])('keeps the session and rejects all waiters on temporary failure %s', async (status) => {
      axios.defaults.adapter = vi.fn(config => rejectRequest(config, status));

      const results = await Promise.allSettled([api.get('/dashboard/stats'), api.get('/workouts')]);

      expect(results.map(result => result.status)).toEqual(['rejected', 'rejected']);
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.logout).not.toHaveBeenCalled();
      expect(axios.defaults.adapter).toHaveBeenCalledTimes(1);

      axios.defaults.adapter = vi.fn(async config => response(config, { data: { accessToken: 'retried' } }));
      await api.get('/dashboard/stats');
      expect(auth.accessToken).toBe('retried');
   });

   it('ends the session when the refresh cookie is expired or revoked', async () => {
      axios.defaults.adapter = vi.fn(config => rejectRequest(config, 401));

      const results = await Promise.allSettled([api.get('/dashboard/stats'), api.get('/workouts')]);

      expect(results.map(result => result.status)).toEqual(['rejected', 'rejected']);
      expect(auth.logout).toHaveBeenCalledTimes(1);
      expect(api.defaults.adapter).not.toHaveBeenCalled();
   });

   it('does not refresh public authentication requests', async () => {
      await api.post('/auth/login', {});
      await api.post('/auth/logout');

      expect(axios.defaults.adapter).not.toHaveBeenCalled();
   });
});