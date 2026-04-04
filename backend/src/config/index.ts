import dotenv from 'dotenv';
dotenv.config();

export const config = {
   port: parseInt(process.env.PORT || '3001', 10),
   nodeEnv: process.env.NODE_ENV || 'development',
   jwtSecret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production');
      return 'dev-fallback-secret';
   })(),
   jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') throw new Error('JWT_REFRESH_SECRET must be set in production');
      return 'dev-fallback-refresh-secret';
   })(),
   jwtAccessExpiry: '15m',
   jwtRefreshExpiry: '7d',
   corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
   bcryptSaltRounds: 12,
   rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
   rateLimitMax: 100,
   paginationDefaultLimit: 20,
   paginationMaxLimit: 100,
} as const;
