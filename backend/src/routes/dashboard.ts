import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/exercise-progression/:exerciseId', dashboardController.getExerciseProgression);

export default router;
