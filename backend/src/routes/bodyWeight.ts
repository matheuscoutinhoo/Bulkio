import { Router } from 'express';
import { bodyWeightController } from '../controllers/bodyWeightController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/errorHandler';
import { createBodyWeightSchema } from '../models/schemas';

const router = Router();

router.use(authenticate);

router.get('/', bodyWeightController.findAll);
router.post('/', validate(createBodyWeightSchema), bodyWeightController.create);
router.delete('/:id', bodyWeightController.delete);

export default router;
