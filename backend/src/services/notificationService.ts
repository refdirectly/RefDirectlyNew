import Notification, { INotification } from '../models/Notification';
import { Server as SocketServer } from 'socket.io';

class NotificationService {
  private io: SocketServer | null = null;

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  async create(data: {
    senderId?: string;
    recipientUserId: string;
    recipientRole: 'seeker' | 'referrer' | 'admin' | 'company_hr';
    title: string;
    message: string;
    type: 'application' | 'message' | 'interview' | 'status_update' | 'system' | 'hr_approval' | 'referral' | 'mention';
    entityId?: string;
    avatarUrl?: string;
    metadata?: any;
  }): Promise<INotification> {
    const notification = await Notification.create(data);
    
    // Emit real-time notification with full data
    if (this.io) {
      const unreadCount = await this.getUnreadCount(data.recipientUserId, data.recipientRole);
      
      this.io.to(`user:${data.recipientUserId}`).emit('notification:new', {
        id: notification._id,
        senderId: notification.senderId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        entityId: notification.entityId,
        avatarUrl: notification.avatarUrl,
        isRead: false,
        createdAt: notification.createdAt
      });
      
      this.io.to(`user:${data.recipientUserId}`).emit('notification:count', unreadCount);
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
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientUserId: userId },
      { isRead: true },
      { new: true }
    );
    
    // Emit updated count
    if (result && this.io) {
      const user = await Notification.findById(notificationId).select('recipientRole');
      if (user) {
        const unreadCount = await this.getUnreadCount(userId, user.recipientRole as any);
        this.io.to(`user:${userId}`).emit('notification:count', unreadCount);
      }
    }
    
    return result;
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
  async broadcastToRole(role: 'seeker' | 'referrer' | 'admin' | 'company_hr', title: string, message: string) {
    if (this.io) {
      this.io.to(`role:${role}`).emit('broadcast_notification', { title, message });
    }
  }
}

export default new NotificationService();
