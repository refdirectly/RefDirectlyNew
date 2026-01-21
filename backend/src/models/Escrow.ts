import mongoose, { Schema, Document } from 'mongoose';

export interface IEscrow extends Document {
  referralId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  amount: number;
  status: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  lockedAt: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EscrowSchema = new Schema({
  referralId: { type: Schema.Types.ObjectId, ref: 'Referral', required: true, unique: true },
  seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['LOCKED', 'RELEASED', 'REFUNDED'], default: 'LOCKED' },
  lockedAt: { type: Date, default: Date.now },
  releasedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IEscrow>('Escrow', EscrowSchema);
