import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  senderId?: mongoose.Types.ObjectId;
  recipientUserId: mongoose.Types.ObjectId;
  recipientRole: 'seeker' | 'referrer' | 'admin' | 'company_hr';
  title: string;
  message: string;
  type: 'application' | 'message' | 'interview' | 'status_update' | 'system' | 'referral' | 'mention';
  entityId?: string;
  isRead: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  recipientUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientRole: { type: String, enum: ['seeker', 'referrer', 'admin', 'company_hr'], required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['application', 'message', 'interview', 'status_update', 'system', 'referral', 'mention'], required: true },
  entityId: { type: String },
  avatarUrl: { type: String },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
