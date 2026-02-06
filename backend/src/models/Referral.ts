import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  jobId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  location?: string;
  source?: 'manual' | 'jsearch';
  status: 'pending' | 'accepted' | 'rejected' | 'interview' | 'hired' | 'completed' | 'expired';
  paymentStatus?: 'held' | 'released' | 'refunded';
  companyHRId?: mongoose.Types.ObjectId; // Auto-assigned after acceptance
  hrChatEnabled: boolean; // Enabled only after HR assignment
  reward: number;
  message?: string;
  resumeUrl?: string;
  seekerProfile: {
    name: string;
    email: string;
    skills: string[];
    experience: string;
  };
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: false },
  seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  company: { type: String, required: true, index: true },
  role: { type: String, required: true },
  location: { type: String },
  source: { type: String, enum: ['manual', 'jsearch'], default: 'manual' },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'interview', 'hired', 'completed', 'expired'],
    default: 'pending',
    index: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['held', 'released', 'refunded']
  },
  companyHRId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  hrChatEnabled: {
    type: Boolean,
    default: false
  },
  reward: { type: Number, required: true },
  message: String,
  resumeUrl: String,
  seekerProfile: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    skills: [String],
    experience: String
  },
  acceptedAt: Date
}, { timestamps: true });

export default mongoose.model<IReferral>('Referral', ReferralSchema);
