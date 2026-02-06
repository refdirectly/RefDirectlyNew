import mongoose, { Document, Schema } from 'mongoose';

export interface IReferralEnhanced extends Document {
  seekerId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  companyHRId?: mongoose.Types.ObjectId; // Auto-assigned after acceptance
  hrChatEnabled: boolean; // Enabled only after HR assignment
  reward: number;
  message?: string;
  seekerProfile: {
    name: string;
    email: string;
    resumeUrl?: string;
    skills: string[];
  };
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralEnhancedSchema = new Schema<IReferralEnhanced>({
  seekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referrerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    index: true // For efficient HR lookup
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
    index: true
  },
  companyHRId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
    // Auto-assigned when status changes to 'accepted'
  },
  hrChatEnabled: {
    type: Boolean,
    default: false
    // Set to true only after companyHRId is assigned
  },
  reward: {
    type: Number,
    required: true,
    min: 0
  },
  message: String,
  seekerProfile: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    resumeUrl: String,
    skills: [String]
  },
  acceptedAt: Date,
  completedAt: Date
}, { 
  timestamps: true
});

// Compound indexes
ReferralEnhancedSchema.index({ company: 1, status: 1 });
ReferralEnhancedSchema.index({ companyHRId: 1, status: 1 });
ReferralEnhancedSchema.index({ seekerId: 1, status: 1 });

// Validation: companyHRId must be a company_hr role user
ReferralEnhancedSchema.pre('save', async function(next) {
  if (this.isModified('companyHRId') && this.companyHRId) {
    const User = mongoose.model('User');
    const hr = await User.findById(this.companyHRId);
    
    if (!hr) {
      return next(new Error('Company HR not found'));
    }
    
    if ((hr as any).role !== 'company_hr') {
      return next(new Error('Assigned user must have company_hr role'));
    }
    
    const hrCompany = (hr as any).company || (hr as any).currentCompany;
    if (hrCompany !== this.company) {
      return next(new Error('HR must belong to the same company as referral'));
    }
    
    if ((hr as any).isActive === false) {
      return next(new Error('Assigned HR must be active'));
    }
  }
  next();
});

export default mongoose.model<IReferralEnhanced>('ReferralEnhanced', ReferralEnhancedSchema);
