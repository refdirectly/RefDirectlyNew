import { Request, Response } from 'express';
import notificationService from '../services/notificationService';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getByUser(userId, role, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    await notificationService.markAllAsRead(userId, role);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const count = await notificationService.getUnreadCount(userId, role);
    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
