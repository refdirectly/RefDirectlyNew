import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction {
  type: 'ADD' | 'WITHDRAW' | 'LOCK' | 'UNLOCK' | 'RELEASE' | 'REFUND';
  amount: number;
  description: string;
  referralId?: string;
  escrowId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  totalBalance: number;
  freeBalance: number;
  lockedBalance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema({
  type: { type: String, enum: ['ADD', 'WITHDRAW', 'LOCK', 'UNLOCK', 'RELEASE', 'REFUND'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
  escrowId: { type: Schema.Types.ObjectId, ref: 'Escrow' },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'COMPLETED' },
  createdAt: { type: Date, default: Date.now }
});

const WalletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalBalance: { type: Number, default: 0, min: 0 },
  freeBalance: { type: Number, default: 0, min: 0 },
  lockedBalance: { type: Number, default: 0, min: 0 },
  transactions: [TransactionSchema]
}, { timestamps: true });

// Ensure balance integrity
WalletSchema.pre('save', function(next) {
  if (Math.abs(this.totalBalance - (this.freeBalance + this.lockedBalance)) > 0.01) {
    return next(new Error('Balance integrity check failed'));
  }
  next();
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);
