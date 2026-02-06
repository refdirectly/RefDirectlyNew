import express from 'express';
import { authenticate } from '../middleware/auth';
import * as companyHRController from '../controllers/companyHRController';

const router = express.Router();

router.post('/assign', authenticate, companyHRController.assignCompanyHR);
router.get('/', authenticate, companyHRController.getCompanyHRs);
router.delete('/:id', authenticate, companyHRController.removeCompanyHR);

export default router;
