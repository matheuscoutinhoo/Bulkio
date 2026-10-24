import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/errorHandler';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../models/schemas';

const router = Router();

// Stricter rate limit for auth endpoints to prevent brute-force attacks
const authLimiter = process.env.NODE_ENV === 'test'
   ? (_req: any, _res: any, next: any) => next()
   : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 attempts per window
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, data: null, message: 'Too many attempts, please try again later' },
   });

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
const passwordLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 5,
   keyGenerator: (req) => req.user!.userId,
   standardHeaders: true,
   legacyHeaders: false,
   message: { success: false, data: null, message: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
});
router.patch('/password', authenticate, passwordLimiter, validate(changePasswordSchema), authController.changePassword);
router.delete('/account', authenticate, authController.deleteAccount);

export default router;
