import express from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, acceptNotification, rejectNotification, deleteNotification, createTestNotification } from '../controllers/notificationController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateJWT, getNotifications);
router.get('/unread-count', authenticateJWT, getUnreadCount);
router.post('/test', authenticateJWT, createTestNotification);
router.patch('/:notificationId/read', authenticateJWT, markAsRead);
router.patch('/mark-all-read', authenticateJWT, markAllAsRead);
router.delete('/:notificationId', authenticateJWT, deleteNotification);
router.post('/:notificationId/accept', authenticateJWT, acceptNotification);
router.post('/:notificationId/reject', authenticateJWT, rejectNotification);

export default router;
