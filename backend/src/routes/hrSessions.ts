import express from 'express';
import { authenticate } from '../middleware/auth';
import * as hrSessionController from '../controllers/hrSessionController';

const router = express.Router();

router.post('/book', authenticate, hrSessionController.bookSession);
router.get('/seeker', authenticate, hrSessionController.getSeekerSessions);
router.get('/hr', authenticate, hrSessionController.getHRSessions);
router.post('/:id/start', authenticate, hrSessionController.startSession);
router.post('/:id/end', authenticate, hrSessionController.endSession);

export default router;
