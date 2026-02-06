import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  packId: mongoose.Types.ObjectId;
  amount: number;
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  expiresAt: Date;
  createdAt: Date;
}

const PurchaseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packId: { type: Schema.Types.ObjectId, ref: 'CareerPack', required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
