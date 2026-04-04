import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { createResponse } from '../models/types';
import { config } from '../config';

export const authController = {
   async register(req: Request, res: Response, next: NextFunction) {
      try {
         const result = await authService.register(req.body);
         res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });
         res.status(201).json(createResponse({
            user: result.user,
            accessToken: result.accessToken,
         }, 'Registration successful'));
      } catch (error) {
         next(error);
      }
   },

   async login(req: Request, res: Response, next: NextFunction) {
      try {
         const result = await authService.login(req.body);
         res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });
         res.json(createResponse({
            user: result.user,
            accessToken: result.accessToken,
         }, 'Login successful'));
      } catch (error) {
         next(error);
      }
   },

   async refresh(req: Request, res: Response, next: NextFunction) {
      try {
         const refreshToken = req.cookies?.refreshToken;
         if (!refreshToken) {
            res.status(401).json({ success: false, data: null, message: 'No refresh token' });
            return;
         }
         const tokens = await authService.refreshToken(refreshToken);
         res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
         });
         res.json(createResponse({ accessToken: tokens.accessToken }));
      } catch (error) {
         next(error);
      }
   },

   async logout(_req: Request, res: Response) {
      res.clearCookie('refreshToken');
      res.json(createResponse(null, 'Logged out'));
   },

   async getProfile(req: Request, res: Response, next: NextFunction) {
      try {
         const user = await authService.getProfile(req.user!.userId);
         res.json(createResponse(user));
      } catch (error) {
         next(error);
      }
   },

   async updateProfile(req: Request, res: Response, next: NextFunction) {
      try {
         const user = await authService.updateProfile(req.user!.userId, req.body);
         res.json(createResponse(user, 'Profile updated'));
      } catch (error) {
         next(error);
      }
   },
};
