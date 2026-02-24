import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  role: 'seeker' | 'referrer' | 'admin' | 'hr' | 'company_hr' | 'job_seeker';
  hrType?: 'open' | 'company';
  name?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  linkedinPassword?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  experience?: number;
  currentCompany?: string;
  company?: string;
  currentTitle?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    grade: string;
  }>;
  workExperience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  companies: Array<{
    name: string;
    verified: boolean;
    roles: string[];
  }>;
  pricePerReferral?: number;
  pricePerSession?: number;
  rating?: number;
  verified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastSeenAt: Date;
  avatarUrl?: string;
  bio?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  role: {
    type: String,
    enum: ['seeker', 'referrer', 'admin', 'hr', 'company_hr', 'job_seeker'],
    required: true
  },
  hrType: {
    type: String,
    enum: ['open', 'company']
  },
  name: String,
  displayName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: String,
  location: String,
  linkedinUrl: String,
  linkedinPassword: String,
  githubUrl: String,
  portfolioUrl: String,
  resumeUrl: String,
  experience: Number,
  currentCompany: String,
  company: String,
  currentTitle: String,
  expectedSalary: String,
  noticePeriod: String,
  skills: [String],
  education: [{
    degree: String,
    institution: String,
    year: String,
    grade: String
  }],
  workExperience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  companies: [{
    name: String,
    verified: { type: Boolean, default: false },
    roles: [String]
  }],
  pricePerReferral: Number,
  pricePerSession: Number,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  },
  avatarUrl: String,
  bio: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

export default mongoose.model<IUser>('User', UserSchema);