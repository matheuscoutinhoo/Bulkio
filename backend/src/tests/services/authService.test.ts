import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../../services/authService';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { createMockUser } from '../helpers';

vi.mock('../../repositories/userRepository', () => ({
   userRepository: {
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
   },
}));

vi.mock('bcrypt', () => ({
   default: {
      hash: vi.fn(),
      compare: vi.fn(),
   },
}));

vi.mock('../../repositories/refreshTokenRepository', () => ({
   refreshTokenRepository: {
      create: vi.fn(),
      findByHash: vi.fn(),
      deleteByHash: vi.fn(),
      deleteAllByUser: vi.fn(),
      deleteExpired: vi.fn(),
   },
}));

import { userRepository } from '../../repositories/userRepository';
import { refreshTokenRepository } from '../../repositories/refreshTokenRepository';

const mockUserRepo = vi.mocked(userRepository);
const mockBcrypt = vi.mocked(bcrypt);
const mockRefreshTokenRepo = vi.mocked(refreshTokenRepository);

describe('authService', () => {
   beforeEach(() => {
      vi.clearAllMocks();
      // Default: refresh token storage succeeds
      mockRefreshTokenRepo.create.mockResolvedValue({} as any);
      mockRefreshTokenRepo.deleteByHash.mockResolvedValue(null as any);
   });

   // ========== register ==========
   describe('register', () => {
      const validInput = { email: 'new@test.com', username: 'newuser', password: 'password123' };

      it('should register a new user and return user + tokens', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(null);
         mockUserRepo.findByUsername.mockResolvedValue(null);
         mockBcrypt.hash.mockResolvedValue('hashed-pw' as never);
         const createdUser = createMockUser({ email: validInput.email, username: validInput.username });
         mockUserRepo.create.mockResolvedValue(createdUser as any);

         const result = await authService.register(validInput);

         expect(result.user).toEqual({
            id: createdUser.id,
            email: validInput.email,
            username: validInput.username,
            createdAt: createdUser.createdAt,
         });
         expect(result.accessToken).toBeDefined();
         expect(result.refreshToken).toBeDefined();
      });

      it('should hash the password before storing', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(null);
         mockUserRepo.findByUsername.mockResolvedValue(null);
         mockBcrypt.hash.mockResolvedValue('hashed-pw' as never);
         mockUserRepo.create.mockResolvedValue(createMockUser() as any);

         await authService.register(validInput);

         expect(mockBcrypt.hash).toHaveBeenCalledWith(validInput.password, 12);
         expect(mockUserRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({ password: 'hashed-pw' }),
         );
      });

      it('should throw ConflictError when email is already registered', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(createMockUser() as any);

         await expect(authService.register(validInput)).rejects.toThrow('Email already registered');
      });

      it('should throw ConflictError when username is already taken', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(null);
         mockUserRepo.findByUsername.mockResolvedValue(createMockUser() as any);

         await expect(authService.register(validInput)).rejects.toThrow('Username already taken');
      });

      it('should not expose password in the returned user object', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(null);
         mockUserRepo.findByUsername.mockResolvedValue(null);
         mockBcrypt.hash.mockResolvedValue('hashed' as never);
         mockUserRepo.create.mockResolvedValue(createMockUser() as any);

         const result = await authService.register(validInput);

         expect(result.user).not.toHaveProperty('password');
      });

      it('should generate tokens containing correct userId and email', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(null);
         mockUserRepo.findByUsername.mockResolvedValue(null);
         mockBcrypt.hash.mockResolvedValue('hashed' as never);
         const user = createMockUser({ email: validInput.email });
         mockUserRepo.create.mockResolvedValue(user as any);

         const result = await authService.register(validInput);

         const accessPayload = jwt.decode(result.accessToken) as any;
         expect(accessPayload.userId).toBe(user.id);
         expect(accessPayload.email).toBe(validInput.email);

         const refreshPayload = jwt.decode(result.refreshToken) as any;
         expect(refreshPayload.userId).toBe(user.id);
         expect(refreshPayload.email).toBe(validInput.email);
      });
   });

   // ========== login ==========
   describe('login', () => {
      const validInput = { email: 'test@example.com', password: 'password123' };

      it('should login successfully with valid credentials', async () => {
         const user = createMockUser();
         mockUserRepo.findByEmail.mockResolvedValue(user as any);
         mockBcrypt.compare.mockResolvedValue(true as never);

         const result = await authService.login(validInput);

         expect(result.user).toEqual({
            id: user.id,
            email: user.email,
            username: user.username,
            goal: user.goal,
            initialWeight: user.initialWeight,
            targetWeight: user.targetWeight,
            height: user.height,
            createdAt: user.createdAt,
         });
         expect(result.accessToken).toBeDefined();
         expect(result.refreshToken).toBeDefined();
      });

      it('should throw UnauthorizedError when email does not exist', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(null);

         await expect(authService.login(validInput)).rejects.toThrow('Invalid email or password');
      });

      it('should throw UnauthorizedError when password is incorrect', async () => {
         mockUserRepo.findByEmail.mockResolvedValue(createMockUser() as any);
         mockBcrypt.compare.mockResolvedValue(false as never);

         await expect(authService.login(validInput)).rejects.toThrow('Invalid email or password');
      });

      it('should use the same error message for bad email and bad password', async () => {
         // Bad email
         mockUserRepo.findByEmail.mockResolvedValue(null);
         const err1 = await authService.login(validInput).catch((e) => e);

         // Bad password
         mockUserRepo.findByEmail.mockResolvedValue(createMockUser() as any);
         mockBcrypt.compare.mockResolvedValue(false as never);
         const err2 = await authService.login(validInput).catch((e) => e);

         expect(err1.message).toBe(err2.message);
      });

      it('should generate tokens containing correct userId and email', async () => {
         const user = createMockUser();
         mockUserRepo.findByEmail.mockResolvedValue(user as any);
         mockBcrypt.compare.mockResolvedValue(true as never);

         const result = await authService.login(validInput);

         const payload = jwt.decode(result.accessToken) as any;
         expect(payload.userId).toBe(user.id);
         expect(payload.email).toBe(user.email);
         expect(payload).toHaveProperty('exp');
      });

      it('should not expose password in the returned user object', async () => {
         const user = createMockUser();
         mockUserRepo.findByEmail.mockResolvedValue(user as any);
         mockBcrypt.compare.mockResolvedValue(true as never);

         const result = await authService.login(validInput);

         expect(result.user).not.toHaveProperty('password');
      });
   });

   // ========== refreshToken ==========
   describe('refreshToken', () => {
      it('should return new tokens for a valid refresh token', async () => {
         const user = createMockUser();
         mockUserRepo.findById.mockResolvedValue(user as any);

         // Create a real refresh token
         const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_REFRESH_SECRET || 'dev-fallback-refresh-secret',
         );

         // Mock: token exists in DB and is not expired
         mockRefreshTokenRepo.findByHash.mockResolvedValue({
            id: 'rt-1',
            tokenHash: 'hash',
            userId: user.id,
            expiresAt: new Date(Date.now() + 86400000),
            createdAt: new Date(),
         } as any);

         const result = await authService.refreshToken(token);

         expect(result.accessToken).toBeDefined();
         expect(result.refreshToken).toBeDefined();
         // Should delete old token and create new one (rotation)
         expect(mockRefreshTokenRepo.deleteByHash).toHaveBeenCalled();
         expect(mockRefreshTokenRepo.create).toHaveBeenCalled();
      });

      it('should throw UnauthorizedError when token is not in DB (revoked)', async () => {
         const token = jwt.sign(
            { userId: 'user-1', email: 'a@b.com' },
            process.env.JWT_REFRESH_SECRET || 'dev-fallback-refresh-secret',
         );
         mockRefreshTokenRepo.findByHash.mockResolvedValue(null);

         await expect(authService.refreshToken(token)).rejects.toThrow('Invalid refresh token');
      });

      it('should throw UnauthorizedError when token is expired in DB', async () => {
         const token = jwt.sign(
            { userId: 'user-1', email: 'a@b.com' },
            process.env.JWT_REFRESH_SECRET || 'dev-fallback-refresh-secret',
         );
         mockRefreshTokenRepo.findByHash.mockResolvedValue({
            id: 'rt-1',
            tokenHash: 'hash',
            userId: 'user-1',
            expiresAt: new Date(Date.now() - 86400000), // expired
            createdAt: new Date(),
         } as any);

         await expect(authService.refreshToken(token)).rejects.toThrow('Invalid refresh token');
         expect(mockRefreshTokenRepo.deleteByHash).toHaveBeenCalled();
      });

      it('should throw UnauthorizedError when JWT is invalid', async () => {
         await expect(authService.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
      });

      it('should throw UnauthorizedError when user in token no longer exists', async () => {
         const token = jwt.sign(
            { userId: 'deleted-user', email: 'gone@test.com' },
            process.env.JWT_REFRESH_SECRET || 'dev-fallback-refresh-secret',
         );
         mockRefreshTokenRepo.findByHash.mockResolvedValue({
            id: 'rt-1',
            tokenHash: 'hash',
            userId: 'deleted-user',
            expiresAt: new Date(Date.now() + 86400000),
            createdAt: new Date(),
         } as any);
         mockUserRepo.findById.mockResolvedValue(null);

         await expect(authService.refreshToken(token)).rejects.toThrow('Invalid refresh token');
      });
   });

   // ========== logout ==========
   describe('logout', () => {
      it('should delete the refresh token from DB', async () => {
         const token = 'some-refresh-token';
         await authService.logout(token);
         expect(mockRefreshTokenRepo.deleteByHash).toHaveBeenCalled();
      });
   });

   // ========== getProfile ==========
   describe('getProfile', () => {
      it('should return user profile for valid userId', async () => {
         const user = createMockUser();
         mockUserRepo.findById.mockResolvedValue(user as any);

         const result = await authService.getProfile('user-1');

         expect(result).toEqual(user);
      });

      it('should throw UnauthorizedError when user is not found', async () => {
         mockUserRepo.findById.mockResolvedValue(null);

         await expect(authService.getProfile('nonexistent')).rejects.toThrow('User not found');
      });
   });

   // ========== updateProfile ==========
   describe('updateProfile', () => {
      it('should update profile successfully when no username conflict', async () => {
         mockUserRepo.findByUsername.mockResolvedValue(null);
         const updated = createMockUser({ username: 'newname' });
         mockUserRepo.update.mockResolvedValue(updated as any);

         const result = await authService.updateProfile('user-1', { username: 'newname' });

         expect(result.username).toBe('newname');
      });

      it('should allow updating username to own current username', async () => {
         const user = createMockUser({ id: 'user-1', username: 'sameuser' });
         mockUserRepo.findByUsername.mockResolvedValue(user as any);
         mockUserRepo.update.mockResolvedValue(user as any);

         await expect(
            authService.updateProfile('user-1', { username: 'sameuser' }),
         ).resolves.toBeDefined();
      });

      it('should throw ConflictError when username is taken by another user', async () => {
         const other = createMockUser({ id: 'other-user', username: 'taken' });
         mockUserRepo.findByUsername.mockResolvedValue(other as any);

         await expect(
            authService.updateProfile('user-1', { username: 'taken' }),
         ).rejects.toThrow('Username already taken');
      });

      it('should skip username check when username is not provided', async () => {
         mockUserRepo.update.mockResolvedValue(createMockUser({ goal: 'BULK' }) as any);

         await authService.updateProfile('user-1', { goal: 'BULK' });

         expect(mockUserRepo.findByUsername).not.toHaveBeenCalled();
      });

      it('should allow partial updates (only goal)', async () => {
         mockUserRepo.update.mockResolvedValue(createMockUser({ goal: 'CUT' }) as any);

         const result = await authService.updateProfile('user-1', { goal: 'CUT' });

         expect(mockUserRepo.update).toHaveBeenCalledWith('user-1', { goal: 'CUT' });
         expect(result.goal).toBe('CUT');
      });
   });

   // ========== deleteAccount ==========
   describe('deleteAccount', () => {
      it('should delete the user when they exist', async () => {
         const user = createMockUser();
         mockUserRepo.findById.mockResolvedValue(user as any);
         mockUserRepo.delete.mockResolvedValue(user as any);

         await authService.deleteAccount('user-1');

         expect(mockUserRepo.findById).toHaveBeenCalledWith('user-1');
         expect(mockUserRepo.delete).toHaveBeenCalledWith('user-1');
      });

      it('should throw UnauthorizedError when user does not exist', async () => {
         mockUserRepo.findById.mockResolvedValue(null);

         await expect(authService.deleteAccount('nonexistent')).rejects.toThrow('User not found');
         expect(mockUserRepo.delete).not.toHaveBeenCalled();
      });
   });
});
