import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesLead extends Document {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'inbound' | 'outbound' | 'referral' | 'website' | 'linkedin' | 'cold_call';
  budget?: number;
  notes: string;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  callHistory: Array<{
    date: Date;
    duration: number;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    aiTranscript?: string;
    outcome: string;
  }>;
  emailHistory: Array<{
    date: Date;
    subject: string;
    body: string;
    type: 'initial' | 'follow_up' | 'proposal' | 'reminder' | 'thank_you';
    opened: boolean;
    clicked: boolean;
  }>;
  aiScore: number;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesLeadSchema = new Schema<ISalesLead>({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  industry: { type: String, required: true },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], required: true },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'new'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  source: { type: String, enum: ['inbound', 'outbound', 'referral', 'website', 'linkedin', 'cold_call'], required: true },
  budget: { type: Number },
  notes: { type: String, default: '' },
  lastContactDate: { type: Date },
  nextFollowUpDate: { type: Date },
  callHistory: [{
    date: { type: Date, default: Date.now },
    duration: { type: Number },
    summary: { type: String },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    aiTranscript: { type: String },
    outcome: { type: String }
  }],
  emailHistory: [{
    date: { type: Date, default: Date.now },
    subject: { type: String },
    body: { type: String },
    type: { type: String, enum: ['initial', 'follow_up', 'proposal', 'reminder', 'thank_you'] },
    opened: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false }
  }],
  aiScore: { type: Number, default: 0, min: 0, max: 100 },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

SalesLeadSchema.index({ email: 1 });
SalesLeadSchema.index({ status: 1 });
SalesLeadSchema.index({ priority: 1 });
SalesLeadSchema.index({ nextFollowUpDate: 1 });
SalesLeadSchema.index({ aiScore: -1 });

export default mongoose.model<ISalesLead>('SalesLead', SalesLeadSchema);
