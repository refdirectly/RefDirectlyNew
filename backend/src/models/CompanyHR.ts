import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyHR extends Document {
  company: string;
  hrId: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
}

const CompanyHRSchema = new Schema({
  company: { type: String, required: true, index: true },
  hrId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

CompanyHRSchema.index({ company: 1, hrId: 1 }, { unique: true });

export default mongoose.model<ICompanyHR>('CompanyHR', CompanyHRSchema);
