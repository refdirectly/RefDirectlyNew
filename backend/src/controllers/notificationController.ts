import { Request, Response } from 'express';
import Notification from '../models/Notification';
import notificationService from '../services/notificationService';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    await Notification.updateMany({ userId, read: false }, { read: true });
    const unreadCount = 0;
    res.json({ success: true, unreadCount });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = (req as any).user?.userId;
    await Notification.findOneAndDelete({ _id: notificationId, userId });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Test endpoint to create sample notifications
export const createTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    // Create a welcome notification
    await notificationService.sendNotification({
      userId,
      type: 'welcome',
      title: 'Welcome to RefDirectly! 🎉',
      message: 'Start exploring job opportunities and connect with referrers.',
      priority: 'high',
      link: '/dashboard'
    });

    res.json({ success: true, message: 'Test notification created' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const acceptNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = (req as any).user.id;

    const notification = await Notification.findOne({ _id: notificationId, userId, status: 'waiting' });
    if (!notification) {
      return res.status(400).json({ success: false, error: 'Notification not found or already accepted' });
    }

    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, status: 'waiting' },
      { status: 'in_progress', acceptedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return res.status(409).json({ success: false, error: 'Another referrer already accepted this request' });
    }

    await Notification.updateMany(
      { jobRequestId: notification.jobRequestId, _id: { $ne: notificationId }, status: 'waiting' },
      { status: 'rejected' }
    );

    res.json({ success: true, notification: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const rejectNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = (req as any).user.id;

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId, status: 'waiting' },
      { status: 'rejected' }
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
