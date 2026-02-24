import { Request, Response } from 'express';
import User from '../models/User';
import CompanyHR from '../models/CompanyHR';

// Search referrers by company
export const searchReferrersByCompany = async (req: Request, res: Response) => {
  try {
    const { company, skills, minExperience, maxExperience } = req.query;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Company name required' });
    }

    const filter: any = {
      role: 'referrer',
      verified: true,
      'companies.name': { $regex: new RegExp(`^${company}$`, 'i') },
      'companies.verified': true
    };

    if (skills) {
      const skillArray = (skills as string).split(',').map(s => s.trim());
      filter.skills = { $in: skillArray };
    }

    if (minExperience || maxExperience) {
      filter.experience = {};
      if (minExperience) filter.experience.$gte = parseInt(minExperience as string);
      if (maxExperience) filter.experience.$lte = parseInt(maxExperience as string);
    }

    const referrers = await User.find(filter)
      .select('name email companies pricePerReferral rating experience skills currentTitle avatarUrl bio')
      .sort({ rating: -1, experience: -1 });

    res.json({
      success: true,
      count: referrers.length,
      referrers
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search HRs by company
export const searchHRsByCompany = async (req: Request, res: Response) => {
  try {
    const { company } = req.query;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Company name required' });
    }

    const companyHRs = await CompanyHR.find({
      company: { $regex: new RegExp(`^${company}$`, 'i') },
      active: true
    }).populate('hrId', 'name email currentCompany pricePerSession rating isActive avatarUrl bio');

    const hrs = companyHRs.map(chr => chr.hrId);

    res.json({
      success: true,
      count: hrs.length,
      hrs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add referrer to company
export const addReferrerToCompany = async (req: Request, res: Response) => {
  try {
    const { userId, company, roles, verified = false } = req.body;

    if (!userId || !company) {
      return res.status(400).json({ success: false, message: 'User ID and company required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'referrer') {
      return res.status(400).json({ success: false, message: 'User must be a referrer' });
    }

    const existingCompany = user.companies.find(
      c => c.name.toLowerCase() === company.toLowerCase()
    );

    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company already added' });
    }

    user.companies.push({
      name: company,
      verified,
      roles: roles || []
    });

    await user.save();

    res.json({
      success: true,
      message: 'Referrer added to company',
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add HR to company
export const addHRToCompany = async (req: Request, res: Response) => {
  try {
    const { hrId, company } = req.body;

    if (!hrId || !company) {
      return res.status(400).json({ success: false, message: 'HR ID and company required' });
    }

    const hr = await User.findById(hrId);
    if (!hr || (hr.role !== 'hr' && hr.role !== 'company_hr')) {
      return res.status(400).json({ success: false, message: 'Invalid HR user' });
    }

    const existing = await CompanyHR.findOne({ company, hrId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'HR already assigned to company' });
    }

    const companyHR = await CompanyHR.create({ company, hrId, active: true });

    res.json({
      success: true,
      message: 'HR added to company',
      companyHR
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all companies with referrer/HR count
export const getCompaniesWithCounts = async (req: Request, res: Response) => {
  try {
    const referrerCounts = await User.aggregate([
      { $match: { role: 'referrer', verified: true } },
      { $unwind: '$companies' },
      { $match: { 'companies.verified': true } },
      { $group: { _id: '$companies.name', referrerCount: { $sum: 1 } } }
    ]);

    const hrCounts = await CompanyHR.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$company', hrCount: { $sum: 1 } } }
    ]);

    const companies = referrerCounts.map(rc => {
      const hrData = hrCounts.find(hc => hc._id === rc._id);
      return {
        company: rc._id,
        referrerCount: rc.referrerCount,
        hrCount: hrData?.hrCount || 0
      };
    });

    res.json({
      success: true,
      companies: companies.sort((a, b) => b.referrerCount - a.referrerCount)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify referrer for company
export const verifyReferrerForCompany = async (req: Request, res: Response) => {
  try {
    const { userId, company } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const companyIndex = user.companies.findIndex(
      c => c.name.toLowerCase() === company.toLowerCase()
    );

    if (companyIndex === -1) {
      return res.status(404).json({ success: false, message: 'Company not found for user' });
    }

    user.companies[companyIndex].verified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Referrer verified for company',
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
