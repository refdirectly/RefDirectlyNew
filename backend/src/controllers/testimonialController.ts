import { Request, Response } from 'express';
import Testimonial from '../models/Testimonial';

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json({ success: true, testimonial });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, testimonial });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    await Testimonial.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
