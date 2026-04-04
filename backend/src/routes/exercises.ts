import { Router } from 'express';
import { exerciseController } from '../controllers/exerciseController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/errorHandler';
import { createExerciseSchema, updateExerciseSchema } from '../models/schemas';

const router = Router();

router.use(authenticate);

router.get('/', exerciseController.findAll);
router.get('/muscle-groups', exerciseController.getMuscleGroups);
router.get('/:id', exerciseController.findById);
router.post('/', validate(createExerciseSchema), exerciseController.create);
router.patch('/:id', validate(updateExerciseSchema), exerciseController.update);
router.delete('/:id', exerciseController.delete);

export default router;
