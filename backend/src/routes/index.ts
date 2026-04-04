import { Router } from 'express';
import authRoutes from './auth';
import exerciseRoutes from './exercises';
import workoutPlanRoutes from './workoutPlans';
import workoutLogRoutes from './workoutLogs';
import bodyWeightRoutes from './bodyWeight';
import dashboardRoutes from './dashboard';

const router = Router();

router.use('/auth', authRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutPlanRoutes);
router.use('/workout-logs', workoutLogRoutes);
router.use('/body-weight', bodyWeightRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
