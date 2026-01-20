import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  coverLetter: string;
  experience: number;
  currentCompany?: string;
  currentRole?: string;
  skills: string[];
  portfolioUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: Date;
  updatedAt: Date;
}

const CareerApplicationSchema = new Schema<ICareerApplication>({
  jobId: { type: Schema.Types.ObjectId, ref: 'CareerJob', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  linkedinUrl: String,
  resumeUrl: String,
  coverLetter: { type: String, required: true },
  experience: { type: Number, required: true },
  currentCompany: String,
  currentRole: String,
  skills: [String],
  portfolioUrl: String,
  expectedSalary: String,
  noticePeriod: String,
  status: { type: String, enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICareerApplication>('CareerApplication', CareerApplicationSchema);
