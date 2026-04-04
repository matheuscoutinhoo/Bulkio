import { Router } from 'express';
import { workoutLogController } from '../controllers/workoutLogController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/errorHandler';
import { createWorkoutLogSchema, updateWorkoutLogSchema } from '../models/schemas';

const router = Router();

router.use(authenticate);

router.get('/', workoutLogController.findAll);
router.get('/:id', workoutLogController.findById);
router.post('/', validate(createWorkoutLogSchema), workoutLogController.create);
router.patch('/:id', validate(updateWorkoutLogSchema), workoutLogController.update);
router.delete('/:id', workoutLogController.delete);

export default router;
