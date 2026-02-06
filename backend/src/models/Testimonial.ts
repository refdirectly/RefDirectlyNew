import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  company: string;
  designation: string;
  avatar?: string;
  quote: string;
  rating: number;
  active: boolean;
  createdAt: Date;
}

const TestimonialSchema = new Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  designation: { type: String, required: true },
  avatar: { type: String },
  quote: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
