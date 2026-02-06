import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerPack extends Document {
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  duration: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerPackSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  features: [{ type: String }],
  duration: { type: Number, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ICareerPack>('CareerPack', CareerPackSchema);
