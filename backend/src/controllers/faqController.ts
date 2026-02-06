import { Request, Response } from 'express';
import FAQ from '../models/FAQ';

export const getFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await FAQ.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, faqs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFAQ = async (req: Request, res: Response) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json({ success: true, faq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFAQ = async (req: Request, res: Response) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, faq });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    await FAQ.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
