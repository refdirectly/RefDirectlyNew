import express from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/hrSessionController';

const router = express.Router();

router.post('/book', authenticate, controller.bookSession);
router.get('/seeker', authenticate, controller.getSeekerSessions);
router.get('/hr', authenticate, controller.getHRSessions);
router.patch('/:id/start', authenticate, controller.startSession);
router.patch('/:id/end', authenticate, controller.endSession);
router.post('/:id/message', authenticate, controller.sendMessage);

export default router;
