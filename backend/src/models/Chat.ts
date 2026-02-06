import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  type: 'open_hr' | 'referral_hr' | 'referrer';
  participants: mongoose.Types.ObjectId[];
  referralId?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

const ChatSchema = new Schema({
  type: { type: String, enum: ['open_hr', 'referral_hr', 'referrer'], required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
  lastMessage: String,
  lastMessageAt: Date
}, { timestamps: true });

ChatSchema.index({ participants: 1 });
ChatSchema.index({ referralId: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
