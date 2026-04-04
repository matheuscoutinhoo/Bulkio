import { Router } from 'express';
import { exerciseController } from '../controllers/exerciseController';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/errorHandler';
import { createExerciseSchema, updateExerciseSchema, exerciseQuerySchema } from '../models/schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(exerciseQuerySchema), exerciseController.findAll);
router.get('/muscle-groups', exerciseController.getMuscleGroups);
router.get('/:id', exerciseController.findById);
router.post('/', validate(createExerciseSchema), exerciseController.create);
router.patch('/:id', validate(updateExerciseSchema), exerciseController.update);
router.delete('/:id', exerciseController.delete);

export default router;
