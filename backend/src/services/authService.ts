import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/userRepository';
import { refreshTokenRepository } from '../repositories/refreshTokenRepository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../models/schemas';
import { AuthTokens, JwtPayload } from '../models/types';

function generateTokens(payload: JwtPayload): AuthTokens {
   const accessToken = jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry,
   });
   const refreshToken = jwt.sign({ ...payload, jti: crypto.randomUUID() }, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiry,
   });
   return { accessToken, refreshToken };
}

function hashToken(token: string): string {
   return crypto.createHash('sha256').update(token).digest('hex');
}

async function storeRefreshToken(refreshToken: string, userId: string): Promise<void> {
   const tokenHash = hashToken(refreshToken);
   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
   await refreshTokenRepository.create(tokenHash, userId, expiresAt);
}

export const authService = {
   async register(data: RegisterInput) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) throw new ConflictError('Email already registered');

      const existingUsername = await userRepository.findByUsername(data.username);
      if (existingUsername) throw new ConflictError('Username already taken');

      const hashedPassword = await bcrypt.hash(data.password, config.bcryptSaltRounds);
      const user = await userRepository.create({
         email: data.email,
         username: data.username,
         password: hashedPassword,
      });

      const tokens = generateTokens({ userId: user.id, email: user.email });
      await storeRefreshToken(tokens.refreshToken, user.id);

      return {
         user: {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
         },
         ...tokens,
      };
   },

   async login(data: LoginInput) {
      const user = await userRepository.findByEmail(data.email);
      if (!user) throw new UnauthorizedError('Invalid email or password');

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) throw new UnauthorizedError('Invalid email or password');

      // Clean up old refresh tokens for this user
      await refreshTokenRepository.deleteAllByUser(user.id);

      const tokens = generateTokens({ userId: user.id, email: user.email });
      await storeRefreshToken(tokens.refreshToken, user.id);

      return {
         user: {
            id: user.id,
            email: user.email,
            username: user.username,
            goal: user.goal,
            createdAt: user.createdAt,
         },
         ...tokens,
      };
   },

   async refreshToken(refreshToken: string) {
      // Verify the token exists in DB (not revoked)
      const tokenHash = hashToken(refreshToken);
      const stored = await refreshTokenRepository.findByHash(tokenHash);
      if (!stored) throw new UnauthorizedError('Invalid refresh token');

      // Check expiry
      if (stored.expiresAt < new Date()) {
         await refreshTokenRepository.deleteByHash(tokenHash);
         throw new UnauthorizedError('Invalid refresh token');
      }

      try {
         const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtPayload;
         const user = await userRepository.findById(decoded.userId);
         if (!user) throw new UnauthorizedError('User not found');

         // Rotate: delete old token, issue and store new one
         await refreshTokenRepository.deleteByHash(tokenHash);
         const tokens = generateTokens({ userId: user.id, email: user.email });
         await storeRefreshToken(tokens.refreshToken, user.id);

         return tokens;
      } catch (error) {
         // If JWT verify fails, delete the stored token too
         await refreshTokenRepository.deleteByHash(tokenHash);
         throw new UnauthorizedError('Invalid refresh token');
      }
   },

   async logout(refreshToken: string) {
      const tokenHash = hashToken(refreshToken);
      await refreshTokenRepository.deleteByHash(tokenHash);
   },

   async getProfile(userId: string) {
      const user = await userRepository.findById(userId);
      if (!user) throw new UnauthorizedError('User not found');
      return user;
   },

   async updateProfile(userId: string, data: UpdateProfileInput) {
      if (data.username) {
         const existing = await userRepository.findByUsername(data.username);
         if (existing && existing.id !== userId) {
            throw new ConflictError('Username already taken');
         }
      }
      return userRepository.update(userId, data);
   },

   async deleteAccount(userId: string) {
      const user = await userRepository.findById(userId);
      if (!user) throw new UnauthorizedError('User not found');
      await userRepository.delete(userId);
   },
};
