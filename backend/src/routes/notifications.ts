import express from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateJWT, getNotifications);
router.get('/unread-count', authenticateJWT, getUnreadCount);
router.patch('/:id/read', authenticateJWT, markAsRead);
router.patch('/mark-all-read', authenticateJWT, markAllAsRead);

export default router;
