import { Router } from 'express';
import { workoutLogController } from '../controllers/workoutLogController';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/errorHandler';
import { createWorkoutLogSchema, updateWorkoutLogSchema, workoutLogQuerySchema } from '../models/schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(workoutLogQuerySchema), workoutLogController.findAll);
router.get('/exercise-history/:exerciseId', workoutLogController.getExerciseLastSession);
router.get('/:id', workoutLogController.findById);
router.post('/', validate(createWorkoutLogSchema), workoutLogController.create);
router.patch('/:id', validate(updateWorkoutLogSchema), workoutLogController.update);
router.delete('/:id', workoutLogController.delete);

export default router;
