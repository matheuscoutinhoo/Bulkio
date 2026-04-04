import { Router } from 'express';
import { workoutPlanController } from '../controllers/workoutPlanController';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/errorHandler';
import { createWorkoutPlanSchema, updateWorkoutPlanSchema, workoutPlanQuerySchema } from '../models/schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(workoutPlanQuerySchema), workoutPlanController.findAll);
router.get('/:id', workoutPlanController.findById);
router.post('/', validate(createWorkoutPlanSchema), workoutPlanController.create);
router.patch('/:id', validate(updateWorkoutPlanSchema), workoutPlanController.update);
router.post('/:id/duplicate', workoutPlanController.duplicate);
router.delete('/:id', workoutPlanController.archive);

export default router;
