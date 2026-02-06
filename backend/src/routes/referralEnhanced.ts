import express from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/referralEnhancedController';

const router = express.Router();

// Referral management
router.post('/', authenticate, controller.createReferralEnhanced);
router.patch('/:id/accept', authenticate, controller.acceptReferral);
router.get('/seeker', authenticate, controller.getSeekerReferrals);
router.get('/hr', authenticate, controller.getHRReferrals);

// HR Chat
router.post('/hr-chat/start', authenticate, controller.startHRChat);
router.post('/hr-chat/message', authenticate, controller.sendHRChatMessage);
router.get('/hr-chat/:referralId/messages', authenticate, controller.getHRChatMessages);
router.get('/hr-chat/chats', authenticate, controller.getHRChats);

export default router;
