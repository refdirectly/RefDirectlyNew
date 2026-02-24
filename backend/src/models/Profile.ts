import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    dateOfBirth?: Date;
  };
  professionalInfo: {
    currentTitle?: string;
    currentCompany?: string;
    totalExperience?: number;
    expectedSalary?: string;
    noticePeriod?: string;
    preferredLocations?: string[];
    openToRemote?: boolean;
  };
  skills: {
    technical: string[];
    soft: string[];
    certifications?: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startYear?: number;
    endYear?: number;
    grade?: string;
    description?: string;
  }>;
  workExperience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    current?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  links: {
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    personalWebsite?: string;
    otherLinks?: Array<{ name: string; url: string }>;
  };
  documents: {
    resumeUrl?: string;
    resumeFileName?: string;
    resumeUploadedAt?: Date;
    coverLetterUrl?: string;
    portfolioFiles?: Array<{ name: string; url: string; uploadedAt: Date }>;
  };
  preferences: {
    jobTypes?: string[];
    industries?: string[];
    companySizes?: string[];
    workMode?: string[];
  };
  bio?: string;
  profileCompleteness: number;
  lastUpdated: Date;
  createdAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true,
    index: true 
  },
  personalInfo: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: { type: String, trim: true, maxlength: 20 },
    location: { type: String, trim: true, maxlength: 100 },
    dateOfBirth: Date
  },
  professionalInfo: {
    currentTitle: { type: String, trim: true, maxlength: 100 },
    currentCompany: { type: String, trim: true, maxlength: 100 },
    totalExperience: { type: Number, min: 0, max: 50 },
    expectedSalary: { type: String, trim: true, maxlength: 50 },
    noticePeriod: { type: String, trim: true, maxlength: 50 },
    preferredLocations: [{ type: String, trim: true }],
    openToRemote: { type: Boolean, default: false }
  },
  skills: {
    technical: { type: [String], default: [] },
    soft: { type: [String], default: [] },
    certifications: { type: [String], default: [] }
  },
  education: [{
    degree: { type: String, required: true, trim: true, maxlength: 100 },
    institution: { type: String, required: true, trim: true, maxlength: 200 },
    fieldOfStudy: { type: String, trim: true, maxlength: 100 },
    startYear: { type: Number, min: 1950, max: 2100 },
    endYear: { type: Number, min: 1950, max: 2100 },
    grade: { type: String, trim: true, maxlength: 20 },
    description: { type: String, trim: true, maxlength: 500 }
  }],
  workExperience: [{
    title: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    location: { type: String, trim: true, maxlength: 100 },
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 2000 },
    achievements: [{ type: String, trim: true, maxlength: 500 }]
  }],
  links: {
    linkedinUrl: { 
      type: String, 
      trim: true,
      match: /^https?:\/\/(www\.)?linkedin\.com\/.+$/
    },
    githubUrl: { 
      type: String, 
      trim: true,
      match: /^https?:\/\/(www\.)?github\.com\/.+$/
    },
    portfolioUrl: { type: String, trim: true },
    personalWebsite: { type: String, trim: true },
    otherLinks: [{
      name: { type: String, trim: true, maxlength: 50 },
      url: { type: String, trim: true }
    }]
  },
  documents: {
    resumeUrl: String,
    resumeFileName: String,
    resumeUploadedAt: Date,
    coverLetterUrl: String,
    portfolioFiles: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  preferences: {
    jobTypes: [String],
    industries: [String],
    companySizes: [String],
    workMode: [String]
  },
  bio: { type: String, trim: true, maxlength: 1000 },
  profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ProfileSchema.index({ 'skills.technical': 1 });
ProfileSchema.index({ 'professionalInfo.currentTitle': 1 });
ProfileSchema.index({ 'professionalInfo.totalExperience': 1 });
ProfileSchema.index({ profileCompleteness: -1 });
ProfileSchema.index({ lastUpdated: -1 });

// Calculate profile completeness before save
ProfileSchema.pre('save', function(next) {
  // Fix skills if corrupted
  if (typeof this.skills === 'string') {
    try {
      this.skills = JSON.parse(this.skills);
    } catch (e) {
      this.skills = { technical: [], soft: [], certifications: [] };
    }
  }
  if (Array.isArray(this.skills)) {
    this.skills = this.skills[0] || { technical: [], soft: [], certifications: [] };
  }
  if (!this.skills || typeof this.skills !== 'object') {
    this.skills = { technical: [], soft: [], certifications: [] };
  }
  if (!Array.isArray(this.skills.technical)) {
    this.skills.technical = [];
  }
  if (!Array.isArray(this.skills.soft)) {
    this.skills.soft = [];
  }

  let completeness = 0;
  const weights = {
    personalInfo: 15,
    professionalInfo: 20,
    skills: 20,
    education: 15,
    workExperience: 15,
    links: 10,
    documents: 5
  };

  if (this.personalInfo?.name && this.personalInfo?.email && this.personalInfo?.phone) {
    completeness += weights.personalInfo;
  }

  if (this.professionalInfo?.currentTitle && this.professionalInfo?.totalExperience !== undefined) {
    completeness += weights.professionalInfo;
  }

  if (this.skills?.technical?.length >= 3) {
    completeness += weights.skills;
  }

  if (this.education?.length > 0) {
    completeness += weights.education;
  }

  if (this.workExperience?.length > 0) {
    completeness += weights.workExperience;
  }

  if (this.links?.linkedinUrl) {
    completeness += weights.links;
  }

  if (this.documents?.resumeUrl) {
    completeness += weights.documents;
  }

  this.profileCompleteness = completeness;
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<IProfile>('Profile', ProfileSchema);
