import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  professionalInfo: {
    currentTitle: string;
    currentCompany: string;
    totalExperience: number;
    expectedSalary?: string;
    noticePeriod?: string;
  };
  technicalSkills: string[];
  softSkills: string[];
  certifications: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }>;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  links: {
    linkedinUrl: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  resumeUrl?: string;
  bio?: string;
  completeness: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  personalInfo: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }
  },
  professionalInfo: {
    currentTitle: { type: String, required: true, trim: true },
    currentCompany: { type: String, trim: true },
    totalExperience: { type: Number, required: true, min: 0 },
    expectedSalary: { type: String, trim: true },
    noticePeriod: { type: String, trim: true }
  },
  technicalSkills: [{ type: String, trim: true }],
  softSkills: [{ type: String, trim: true }],
  certifications: [{ type: String, trim: true }],
  education: [{
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    grade: { type: String, trim: true }
  }],
  workExperience: [{
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
  }],
  links: {
    linkedinUrl: { type: String, required: true, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true }
  },
  resumeUrl: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 1000 },
  completeness: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

UserProfileSchema.index({ 'technicalSkills': 1 });
UserProfileSchema.index({ 'professionalInfo.totalExperience': 1 });

UserProfileSchema.pre('save', function(next) {
  let score = 0;
  if (this.personalInfo?.name && this.personalInfo?.email && this.personalInfo?.phone && this.personalInfo?.location) score += 20;
  if (this.professionalInfo?.currentTitle && this.professionalInfo?.totalExperience !== undefined) score += 20;
  if (this.technicalSkills?.length >= 3) score += 20;
  if (this.education?.length > 0) score += 15;
  if (this.workExperience?.length > 0) score += 15;
  if (this.links?.linkedinUrl) score += 10;
  
  this.completeness = score;
  next();
});

export default mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
