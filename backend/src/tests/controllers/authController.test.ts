import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authController } from '../../controllers/authController';
import { mockRequest, mockResponse, mockNext } from '../helpers';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

vi.mock('../../services/authService', () => ({
   authService: {
      register: vi.fn(),
      login: vi.fn(),
      refreshToken: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
   },
}));

import { authService } from '../../services/authService';

const mockService = vi.mocked(authService);

describe('authController', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   // ========== register ==========
   describe('register', () => {
      it('should return 201 with user and accessToken on success', async () => {
         const serviceResult = {
            user: { id: 'u1', email: 'a@b.com', username: 'user1', createdAt: new Date() },
            accessToken: 'access-tok',
            refreshToken: 'refresh-tok',
         };
         mockService.register.mockResolvedValue(serviceResult);

         const req = mockRequest({ body: { email: 'a@b.com', username: 'user1', password: '12345678' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.register(req, res, next);

         expect(res.status).toHaveBeenCalledWith(201);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: expect.objectContaining({
                  user: serviceResult.user,
                  accessToken: 'access-tok',
               }),
            }),
         );
         // refreshToken should be set as httpOnly cookie, NOT in the JSON body
         expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'refresh-tok',
            expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
         );
      });

      it('should NOT expose refreshToken in the JSON response body', async () => {
         const serviceResult = {
            user: { id: 'u1', email: 'a@b.com', username: 'user1', createdAt: new Date() },
            accessToken: 'access-tok',
            refreshToken: 'refresh-tok',
         };
         mockService.register.mockResolvedValue(serviceResult);

         const req = mockRequest({ body: { email: 'a@b.com', username: 'user1', password: '12345678' } });
         const res = mockResponse();

         await authController.register(req, res, mockNext());

         const jsonData = (res.json as any).mock.calls[0][0];
         expect(jsonData.data).not.toHaveProperty('refreshToken');
      });

      it('should call next(error) when service throws', async () => {
         mockService.register.mockRejectedValue(new ConflictError('Email already registered'));

         const req = mockRequest({ body: {} });
         const res = mockResponse();
         const next = mockNext();

         await authController.register(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
         expect(next.mock.calls[0][0]).toBeDefined();
         expect(res.status).not.toHaveBeenCalled();
      });
   });

   // ========== login ==========
   describe('login', () => {
      it('should return 200 with user and accessToken on success', async () => {
         const serviceResult = {
            user: { id: 'u1', email: 'a@b.com', username: 'user1', goal: null, createdAt: new Date() },
            accessToken: 'access-tok',
            refreshToken: 'refresh-tok',
         };
         mockService.login.mockResolvedValue(serviceResult);

         const req = mockRequest({ body: { email: 'a@b.com', password: '12345678' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.login(req, res, next);

         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: expect.objectContaining({
                  user: serviceResult.user,
                  accessToken: 'access-tok',
               }),
            }),
         );
         expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'refresh-tok',
            expect.objectContaining({ httpOnly: true }),
         );
      });

      it('should NOT expose refreshToken in the JSON response body', async () => {
         const serviceResult = {
            user: { id: 'u1', email: 'a@b.com', username: 'user1', goal: null, createdAt: new Date() },
            accessToken: 'access-tok',
            refreshToken: 'refresh-tok',
         };
         mockService.login.mockResolvedValue(serviceResult);

         const req = mockRequest({ body: { email: 'a@b.com', password: '12345678' } });
         const res = mockResponse();

         await authController.login(req, res, mockNext());

         const jsonData = (res.json as any).mock.calls[0][0];
         expect(jsonData.data).not.toHaveProperty('refreshToken');
      });

      it('should call next(error) when login fails', async () => {
         mockService.login.mockRejectedValue(new UnauthorizedError('Invalid email or password'));

         const req = mockRequest({ body: { email: 'wrong@test.com', password: 'wrong' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.login(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
         expect(next.mock.calls[0][0].message).toBe('Invalid email or password');
      });
   });

   // ========== refresh ==========
   describe('refresh', () => {
      it('should return new accessToken and set new refreshToken cookie', async () => {
         mockService.refreshToken.mockResolvedValue({
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
         });

         const req = mockRequest({ cookies: { refreshToken: 'old-refresh' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.refresh(req, res, next);

         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: { accessToken: 'new-access' },
            }),
         );
         expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'new-refresh',
            expect.objectContaining({ httpOnly: true }),
         );
      });

      it('should return 401 when no refreshToken cookie is present', async () => {
         const req = mockRequest({ cookies: {} });
         const res = mockResponse();
         const next = mockNext();

         await authController.refresh(req, res, next);

         expect(res.status).toHaveBeenCalledWith(401);
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false, message: 'No refresh token' }),
         );
      });

      it('should call next(error) when refresh token is invalid', async () => {
         mockService.refreshToken.mockRejectedValue(
            new UnauthorizedError('Invalid refresh token'),
         );

         const req = mockRequest({ cookies: { refreshToken: 'expired-tok' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.refresh(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
         expect(next.mock.calls[0][0].message).toBe('Invalid refresh token');
      });
   });

   // ========== logout ==========
   describe('logout', () => {
      it('should call authService.logout, clear cookie, and return success', async () => {
         mockService.logout.mockResolvedValue(undefined as any);
         const req = mockRequest({ cookies: { refreshToken: 'some-token' } });
         const res = mockResponse();

         await authController.logout(req, res);

         expect(mockService.logout).toHaveBeenCalledWith('some-token');
         expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, message: 'Logged out' }),
         );
      });

      it('should still succeed when no refresh token cookie exists', async () => {
         const req = mockRequest({ cookies: {} });
         const res = mockResponse();

         await authController.logout(req, res);

         expect(mockService.logout).not.toHaveBeenCalled();
         expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, message: 'Logged out' }),
         );
      });
   });

   // ========== getProfile ==========
   describe('getProfile', () => {
      it('should return user profile', async () => {
         const user = { id: 'u1', email: 'a@b.com', username: 'user1' };
         mockService.getProfile.mockResolvedValue(user as any);

         const req = mockRequest({ user: { userId: 'u1', email: 'a@b.com' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.getProfile(req, res, next);

         expect(mockService.getProfile).toHaveBeenCalledWith('u1');
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: user }),
         );
      });

      it('should call next(error) when user not found', async () => {
         mockService.getProfile.mockRejectedValue(new UnauthorizedError('User not found'));

         const req = mockRequest({ user: { userId: 'gone', email: 'x@x.com' } });
         const res = mockResponse();
         const next = mockNext();

         await authController.getProfile(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
      });
   });

   // ========== updateProfile ==========
   describe('updateProfile', () => {
      it('should return updated user profile', async () => {
         const updated = { id: 'u1', email: 'a@b.com', username: 'newname', goal: 'BULK' };
         mockService.updateProfile.mockResolvedValue(updated as any);

         const req = mockRequest({
            user: { userId: 'u1', email: 'a@b.com' },
            body: { username: 'newname', goal: 'BULK' },
         });
         const res = mockResponse();
         const next = mockNext();

         await authController.updateProfile(req, res, next);

         expect(mockService.updateProfile).toHaveBeenCalledWith('u1', { username: 'newname', goal: 'BULK' });
         expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
               success: true,
               data: updated,
               message: 'Profile updated',
            }),
         );
      });

      it('should call next(error) when username conflict', async () => {
         mockService.updateProfile.mockRejectedValue(new ConflictError('Username already taken'));

         const req = mockRequest({
            user: { userId: 'u1', email: 'a@b.com' },
            body: { username: 'taken' },
         });
         const res = mockResponse();
         const next = mockNext();

         await authController.updateProfile(req, res, next);

         expect(next).toHaveBeenCalledTimes(1);
         expect(next.mock.calls[0][0].message).toBe('Username already taken');
      });
   });
});
