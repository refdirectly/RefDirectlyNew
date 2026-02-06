import express from 'express';
import { authenticate } from '../middleware/auth';
import * as referralHRChatController from '../controllers/referralHRChatController';

const router = express.Router();

router.post('/start', authenticate, referralHRChatController.startReferralHRChat);
router.post('/message', authenticate, referralHRChatController.sendReferralHRMessage);
router.get('/:chatId/messages', authenticate, referralHRChatController.getReferralHRMessages);
router.get('/my-chats', authenticate, referralHRChatController.getMyReferralChats);

export default router;
