import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { createResponse, createErrorResponse } from '../models/types';
import { config } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { CookieOptions } from 'express';

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
   httpOnly: true,
   secure: config.nodeEnv === 'production',
   sameSite: 'strict',
   maxAge: config.jwtRefreshExpiry * 1000,
};

export const authController = {
   register: asyncHandler(async (req: Request, res: Response) => {
      const result = await authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json(createResponse({
         user: result.user,
         accessToken: result.accessToken,
      }, 'Registration successful'));
   }),

   login: asyncHandler(async (req: Request, res: Response) => {
      const result = await authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json(createResponse({
         user: result.user,
         accessToken: result.accessToken,
      }, 'Login successful'));
   }),

   refresh: asyncHandler(async (req: Request, res: Response) => {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
         res.status(401).json(createErrorResponse('No refresh token'));
         return;
      }
      const tokens = await authService.refreshToken(refreshToken);
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json(createResponse({ accessToken: tokens.accessToken }));
   }),

   logout: asyncHandler(async (req: Request, res: Response) => {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
         await authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      res.json(createResponse(null, 'Logged out'));
   }),

   getProfile: asyncHandler(async (req: Request, res: Response) => {
      const user = await authService.getProfile(req.user!.userId);
      res.json(createResponse(user));
   }),

   updateProfile: asyncHandler(async (req: Request, res: Response) => {
      const user = await authService.updateProfile(req.user!.userId, req.body);
      res.json(createResponse(user, 'Profile updated'));
   }),

   deleteAccount: asyncHandler(async (req: Request, res: Response) => {
      await authService.deleteAccount(req.user!.userId);
      res.clearCookie('refreshToken');
      res.json(createResponse(null, 'Account deleted'));
   }),
};
