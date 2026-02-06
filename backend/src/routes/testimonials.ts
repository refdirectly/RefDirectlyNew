import express from 'express';
import { authenticate } from '../middleware/auth';
import * as testimonialController from '../controllers/testimonialController';

const router = express.Router();

router.get('/', testimonialController.getTestimonials);
router.post('/', authenticate, testimonialController.createTestimonial);
router.put('/:id', authenticate, testimonialController.updateTestimonial);
router.delete('/:id', authenticate, testimonialController.deleteTestimonial);

export default router;
