import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/userRepository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../models/schemas';
import { AuthTokens, JwtPayload } from '../models/types';

function generateTokens(payload: JwtPayload): AuthTokens {
   const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry,
   });
   const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiry,
   });
   return { accessToken, refreshToken };
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

      const tokens = generateTokens({ userId: user.id, email: user.email });

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
      try {
         const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtPayload;
         const user = await userRepository.findById(decoded.userId);
         if (!user) throw new UnauthorizedError('User not found');

         return generateTokens({ userId: user.id, email: user.email });
      } catch {
         throw new UnauthorizedError('Invalid refresh token');
      }
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
};
