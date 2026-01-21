import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = express.Router();

router.get('/', authenticateToken, notificationController.getNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.patch('/mark-all-read', authenticateToken, notificationController.markAllAsRead);

export default router;
