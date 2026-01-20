import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerJob extends Document {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salaryRange?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerJobSchema = new Schema<ICareerJob>({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true, default: 'Remote' },
  type: { type: String, required: true, default: 'Full-time' },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  salaryRange: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICareerJob>('CareerJob', CareerJobSchema);
