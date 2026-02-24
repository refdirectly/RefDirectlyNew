import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  method: 'bank_transfer' | 'upi' | 'paypal';
  accountDetails: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    upiId?: string;
    paypalEmail?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  requestedAt: Date;
  approvedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 100 },
  method: { type: String, enum: ['bank_transfer', 'upi', 'paypal'], required: true },
  accountDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String,
    paypalEmail: String
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED'], 
    default: 'PENDING' 
  },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  processedAt: Date,
  completedAt: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  transactionId: String
}, { timestamps: true });

WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ status: 1, requestedAt: -1 });

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
