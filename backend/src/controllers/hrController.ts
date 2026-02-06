import { Request, Response } from 'express';
import User from '../models/User';

export const getVerifiedHRExperts = async (req: Request, res: Response) => {
  try {
    const hrExperts = await User.find({
      role: 'company_hr',
      verified: true,
      isActive: true,
      email: { $not: /^hr@.*\.com$/ } // Exclude seed accounts like hr@google.com
    })
    .select('name email company currentTitle experience pricePerSession rating bio avatarUrl')
    .sort({ rating: -1, experience: -1 });

    res.json({ success: true, data: hrExperts });
  } catch (error) {
    console.error('Error fetching HR experts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch HR experts' });
  }
};

export const getHRExpertCount = async (req: Request, res: Response) => {
  try {
    const count = await User.countDocuments({
      role: 'company_hr',
      verified: true,
      isActive: true,
      email: { $not: /^hr@.*\.com$/ } // Exclude seed accounts
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching HR count:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch HR count' });
  }
};
