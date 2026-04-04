import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
   origin: config.corsOrigin,
   credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
   windowMs: config.rateLimitWindowMs,
   max: config.rateLimitMax,
   standardHeaders: true,
   legacyHeaders: false,
   message: { success: false, data: null, message: 'Too many requests, please try again later' },
});
app.use(limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(requestLogger);

// Health check
app.get('/api/health', (_req, res) => {
   res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// API routes
app.use('/api/v1', routes);

// Error handling (must be last)
app.use(errorHandler);

export default app;
