import { Request, Response } from 'express';
import CompanyHR from '../models/CompanyHR';
import User from '../models/User';

export const assignCompanyHR = async (req: Request, res: Response) => {
  try {
    const { company, hrId } = req.body;

    const hr = await User.findById(hrId);
    if (!hr || (hr.role !== 'hr' && hr.role !== 'company_hr')) {
      return res.status(400).json({ success: false, message: 'Invalid HR user' });
    }

    const companyHR = new CompanyHR({ company, hrId });
    await companyHR.save();

    res.json({ success: true, companyHR });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyHRs = async (req: Request, res: Response) => {
  try {
    const { company } = req.query;
    const filter: any = { active: true };
    if (company) filter.company = company;

    const companyHRs = await CompanyHR.find(filter).populate('hrId', 'name email currentCompany');
    res.json({ success: true, companyHRs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeCompanyHR = async (req: Request, res: Response) => {
  try {
    await CompanyHR.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ success: true, message: 'HR removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
