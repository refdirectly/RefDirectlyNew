import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeVerification extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  verificationType: 'email' | 'document' | 'linkedin' | 'github' | 'manual';
  status: 'pending' | 'approved' | 'rejected';
  
  // Email verification
  workEmail?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  
  // Document verification
  documents?: {
    idCard?: string;
    offerLetter?: string;
    payslip?: string;
    employeeIdCard?: string;
  };
  
  // LinkedIn verification
  linkedinProfile?: string;
  linkedinVerified?: boolean;
  linkedinData?: {
    currentPosition?: string;
    currentCompany?: string;
    profileUrl?: string;
    verified?: boolean;
  };
  
  // GitHub verification (for tech companies)
  githubUsername?: string;
  githubVerified?: boolean;
  githubData?: {
    company?: string;
    email?: string;
    verified?: boolean;
  };
  
  // Additional info
  employeeId?: string;
  department?: string;
  designation?: string;
  joiningDate?: Date;
  
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  verificationScore: number; // 0-100
  autoVerified: boolean;
}

const EmployeeVerificationSchema = new Schema<IEmployeeVerification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  verificationType: {
    type: String,
    enum: ['email', 'document', 'linkedin', 'github', 'manual'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Email verification
  workEmail: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  
  // Document verification
  documents: {
    idCard: String,
    offerLetter: String,
    payslip: String,
    employeeIdCard: String
  },
  
  // LinkedIn verification
  linkedinProfile: String,
  linkedinVerified: { type: Boolean, default: false },
  linkedinData: {
    currentPosition: String,
    currentCompany: String,
    profileUrl: String,
    verified: Boolean
  },
  
  // GitHub verification
  githubUsername: String,
  githubVerified: { type: Boolean, default: false },
  githubData: {
    company: String,
    email: String,
    verified: Boolean
  },
  
  // Additional info
  employeeId: String,
  department: String,
  designation: String,
  joiningDate: Date,
  
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  verificationScore: { type: Number, default: 0, min: 0, max: 100 },
  autoVerified: { type: Boolean, default: false }
});

export default mongoose.model<IEmployeeVerification>('EmployeeVerification', EmployeeVerificationSchema);
