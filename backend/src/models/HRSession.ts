import mongoose, { Document, Schema } from 'mongoose';

export interface IHRSession extends Document {
  seekerId: mongoose.Types.ObjectId;
  hrId: mongoose.Types.ObjectId;
  sessionType: 'chat' | 'voice' | 'video';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  price: number;
  amount: number; // Alias for price
  notes?: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  roomId?: string;
  messages?: Array<{
    senderId: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
  }>;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HRSessionSchema = new Schema<IHRSession>({
  seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  hrId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionType: { type: String, enum: ['chat', 'voice', 'video'], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  scheduledAt: { type: Date, required: true },
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  price: { type: Number, required: true },
  amount: { type: Number }, // Alias for price
  notes: String,
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  roomId: String,
  messages: [{
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  rating: { type: Number, min: 1, max: 5 },
  feedback: String
}, { timestamps: true });

export default mongoose.model<IHRSession>('HRSession', HRSessionSchema);
