import express from 'express';
import { authenticate } from '../middleware/auth';
import * as faqController from '../controllers/faqController';

const router = express.Router();

router.get('/', faqController.getFAQs);
router.post('/', authenticate, faqController.createFAQ);
router.put('/:id', authenticate, faqController.updateFAQ);
router.delete('/:id', authenticate, faqController.deleteFAQ);

export default router;
