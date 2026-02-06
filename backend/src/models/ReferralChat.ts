import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  senderId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface IReferralChat extends Document {
  referralId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  hrId: mongoose.Types.ObjectId;
  company: string;
  messages: IChatMessage[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const ReferralChatSchema = new Schema<IReferralChat>({
  referralId: {
    type: Schema.Types.ObjectId,
    ref: 'ReferralEnhanced',
    required: true,
    unique: true,
    index: true
  },
  seekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hrId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  messages: [ChatMessageSchema],
  lastMessageAt: Date
}, { timestamps: true });

// Compound indexes
ReferralChatSchema.index({ hrId: 1, company: 1 });
ReferralChatSchema.index({ seekerId: 1, referralId: 1 });

// Validation: Ensure HR belongs to same company
ReferralChatSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const hr = await User.findById(this.hrId);
    
    if (!hr || hr.role !== 'company_hr') {
      return next(new Error('Invalid HR user'));
    }
    
    const hrCompany = (hr as any).company || (hr as any).currentCompany;
    if (hrCompany !== this.company) {
      return next(new Error('HR must belong to the same company'));
    }
  }
  next();
});

export default mongoose.model<IReferralChat>('ReferralChat', ReferralChatSchema);
