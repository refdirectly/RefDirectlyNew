import express from 'express';
import { authenticate } from '../middleware/auth';
import * as careerPackController from '../controllers/careerPackController';

const router = express.Router();

router.get('/', careerPackController.getPacks);
router.post('/', authenticate, careerPackController.createPack);
router.put('/:id', authenticate, careerPackController.updatePack);
router.delete('/:id', authenticate, careerPackController.deletePack);
router.post('/:id/purchase', authenticate, careerPackController.purchasePack);
router.get('/purchases', authenticate, careerPackController.getMyPurchases);

export default router;
