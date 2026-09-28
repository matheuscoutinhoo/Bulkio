import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import routes from './routes';
import prisma from './config/database';

const app = express();

// Security
app.use(helmet());
app.use(cors({
   origin: config.corsOrigin,
   credentials: true,
}));

// Rate limiting (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
   const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, data: null, message: 'Too many requests, please try again later' },
   });
   app.use(limiter);
}

// Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(requestLogger);

// Health check
app.get('/api/health', async (_req, res, next) => {
   try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
         success: true,
         data: { status: 'ok', database: 'connected', timestamp: new Date().toISOString() },
      });
   } catch (error) {
      next(error);
   }
});

// API routes
app.use('/api/v1', routes);

// In production, the same service serves the compiled React application.
if (config.staticFilesPath) {
   const staticFilesPath = path.resolve(config.staticFilesPath);
   app.use(express.static(staticFilesPath));
   app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
         next();
         return;
      }
      res.sendFile(path.join(staticFilesPath, 'index.html'));
   });
}

// Error handling (must be last)
app.use(errorHandler);

export default app;
