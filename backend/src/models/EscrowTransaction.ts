import mongoose, { Schema, Document } from 'mongoose';

export interface IEscrowTransaction extends Document {
  referralId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  amount: number;
  platformFee: number;
  referrerAmount: number;
  status: 'LOCKED' | 'PENDING_APPROVAL' | 'APPROVED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  paymentMethod: string;
  paymentDetails: any;
  lockedAt: Date;
  approvedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  dispute?: {
    reason: string;
    filedBy: mongoose.Types.ObjectId;
    filedAt: Date;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
    resolution?: string;
    resolvedAt?: Date;
    resolvedBy?: mongoose.Types.ObjectId;
  };
  fraudCheck?: {
    score: number;
    flags: string[];
    checkedAt: Date;
    status: 'CLEAN' | 'SUSPICIOUS' | 'FLAGGED';
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EscrowTransactionSchema = new Schema({
  referralId: { type: Schema.Types.ObjectId, ref: 'Referral', required: true, unique: true },
  seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  platformFee: { type: Number, required: true, default: 0 },
  referrerAmount: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ['LOCKED', 'PENDING_APPROVAL', 'APPROVED', 'RELEASED', 'REFUNDED', 'DISPUTED'], 
    default: 'LOCKED' 
  },
  paymentMethod: { type: String, default: 'wallet' },
  paymentDetails: { type: Schema.Types.Mixed },
  lockedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  releasedAt: { type: Date },
  refundedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  dispute: {
    reason: String,
    filedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    filedAt: Date,
    status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED'] },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  fraudCheck: {
    score: { type: Number, min: 0, max: 100 },
    flags: [String],
    checkedAt: Date,
    status: { type: String, enum: ['CLEAN', 'SUSPICIOUS', 'FLAGGED'] }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  }
}, { timestamps: true });

EscrowTransactionSchema.index({ seekerId: 1, status: 1 });
EscrowTransactionSchema.index({ referrerId: 1, status: 1 });
EscrowTransactionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IEscrowTransaction>('EscrowTransaction', EscrowTransactionSchema);
