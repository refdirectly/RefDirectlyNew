import Notification, { INotification } from '../models/Notification';
import { Server as SocketServer } from 'socket.io';

class NotificationService {
  private io: SocketServer | null = null;

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  async create(data: {
    recipientUserId: string;
    recipientRole: 'seeker' | 'referrer' | 'admin';
    title: string;
    message: string;
    type: 'application' | 'message' | 'interview' | 'status_update' | 'system';
    entityId?: string;
  }): Promise<INotification> {
    const notification = await Notification.create(data);
    
    // Emit real-time notification
    if (this.io) {
      this.io.to(`user:${data.recipientUserId}`).emit('new_notification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        entityId: notification.entityId,
        createdAt: notification.createdAt
      });
    }
    
    return notification;
  }

  async getByUser(userId: string, role: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipientUserId: userId, recipientRole: role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientUserId: userId, recipientRole: role }),
      Notification.countDocuments({ recipientUserId: userId, recipientRole: role, isRead: false })
    ]);

    return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientUserId: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string, role: string) {
    return Notification.updateMany(
      { recipientUserId: userId, recipientRole: role, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string, role: string) {
    return Notification.countDocuments({ recipientUserId: userId, recipientRole: role, isRead: false });
  }

  // Broadcast to all users of a role
  async broadcastToRole(role: 'seeker' | 'referrer' | 'admin', title: string, message: string) {
    if (this.io) {
      this.io.to(`role:${role}`).emit('broadcast_notification', { title, message });
    }
  }
}

export default new NotificationService();
