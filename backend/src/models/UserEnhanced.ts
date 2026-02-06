import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  role: 'job_seeker' | 'referrer' | 'company_hr' | 'admin';
  name: string;
  email: string;
  passwordHash: string;
  company?: string; // Mandatory for referrer & company_hr
  isActive: boolean;
  phone?: string;
  avatarUrl?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  role: {
    type: String,
    enum: ['job_seeker', 'referrer', 'company_hr', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  company: {
    type: String,
    trim: true,
    // Validation: company is mandatory for referrer and company_hr
    validate: {
      validator: function(this: IUser, value: string) {
        if (this.role === 'referrer' || this.role === 'company_hr') {
          return !!value && value.length > 0;
        }
        return true;
      },
      message: 'Company is required for referrer and company_hr roles'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phone: String,
  avatarUrl: String,
  verified: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true
});

// Compound index for efficient HR lookup
UserSchema.index({ role: 1, company: 1, isActive: 1 });

// Pre-save hook to enforce company requirement
UserSchema.pre('save', function(next) {
  const user = this as IUser;
  if ((user.role === 'referrer' || user.role === 'company_hr') && user.company === undefined) {
    return next(new Error('Company is required for referrer and company_hr roles'));
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
