import mongoose, { Schema, Document } from 'mongoose';

export interface IReferralVerification extends Document {
  referralId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected' | 'disputed';
  verificationStage: 'referral_sent' | 'interview_scheduled' | 'offer_received' | 'joined' | 'completed';
  
  // Evidence submitted
  evidence: Array<{
    type: 'screenshot' | 'email' | 'offer_letter' | 'joining_letter' | 'payslip' | 'other';
    url: string;
    uploadedBy: 'seeker' | 'referrer';
    uploadedAt: Date;
    verified: boolean;
  }>;
  
  // AI Analysis
  aiAnalysis: {
    confidenceScore: number; // 0-100
    fraudRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
    analyzedAt: Date;
    evidenceQuality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  
  // Payment details
  payment: {
    totalAmount: number;
    platformFee: number;
    platformFeePercentage: number;
    referrerAmount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    processedAt?: Date;
    transactionId?: string;
  };
  
  // Timeline
  timeline: Array<{
    stage: string;
    status: string;
    date: Date;
    notes?: string;
    verifiedBy?: 'ai' | 'admin' | 'user';
  }>;
  
  // Dispute handling
  dispute?: {
    raised: boolean;
    raisedBy: 'seeker' | 'referrer';
    reason: string;
    raisedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
  };
  
  adminNotes?: string;
  autoVerified: boolean;
  manualReviewRequired: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const ReferralVerificationSchema = new Schema<IReferralVerification>({
  referralId: { type: Schema.Types.ObjectId, ref: 'Referral', required: true, unique: true },
  seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'disputed'],
    default: 'pending'
  },
  
  verificationStage: {
    type: String,
    enum: ['referral_sent', 'interview_scheduled', 'offer_received', 'joined', 'completed'],
    default: 'referral_sent'
  },
  
  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'email', 'offer_letter', 'joining_letter', 'payslip', 'other'],
      required: true
    },
    url: { type: String, required: true },
    uploadedBy: { type: String, enum: ['seeker', 'referrer'], required: true },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  
  aiAnalysis: {
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    fraudRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    recommendations: [String],
    analyzedAt: Date,
    evidenceQuality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] }
  },
  
  payment: {
    totalAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    platformFeePercentage: { type: Number, default: 10 },
    referrerAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    processedAt: Date,
    transactionId: String
  },
  
  timeline: [{
    stage: { type: String, required: true },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: String,
    verifiedBy: { type: String, enum: ['ai', 'admin', 'user'] }
  }],
  
  dispute: {
    raised: { type: Boolean, default: false },
    raisedBy: { type: String, enum: ['seeker', 'referrer'] },
    reason: String,
    raisedAt: Date,
    resolvedAt: Date,
    resolution: String
  },
  
  adminNotes: String,
  autoVerified: { type: Boolean, default: false },
  manualReviewRequired: { type: Boolean, default: false }
  
}, { timestamps: true });

// Indexes
ReferralVerificationSchema.index({ referralId: 1 });
ReferralVerificationSchema.index({ verificationStatus: 1 });
ReferralVerificationSchema.index({ 'payment.status': 1 });
ReferralVerificationSchema.index({ seekerId: 1, referrerId: 1 });

export default mongoose.model<IReferralVerification>('ReferralVerification', ReferralVerificationSchema);
