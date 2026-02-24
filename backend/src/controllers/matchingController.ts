import { Request, Response } from 'express';
import { findMatchingReferrers, getTopReferrersForJob, getReferrerAvailability } from '../services/referralMatchingService';

// Get matched referrers for a job
export const getMatchedReferrers = async (req: Request, res: Response) => {
  try {
    const { company, skills, experience, limit } = req.query;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Company name required' });
    }

    const skillArray = skills ? (skills as string).split(',').map(s => s.trim()) : [];
    const expLevel = experience ? parseInt(experience as string) : undefined;
    const maxResults = limit ? parseInt(limit as string) : 10;

    const matches = await getTopReferrersForJob(
      company as string,
      skillArray,
      expLevel || 0,
      maxResults
    );

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get referrer availability status
export const checkReferrerAvailability = async (req: Request, res: Response) => {
  try {
    const { referrerId } = req.params;

    const availability = await getReferrerAvailability(referrerId);

    res.json({
      success: true,
      ...availability
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get best referrer for specific criteria
export const getBestReferrer = async (req: Request, res: Response) => {
  try {
    const { company, skills, experience } = req.body;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Company name required' });
    }

    const matches = await findMatchingReferrers({
      company,
      requiredSkills: skills || [],
      experienceLevel: experience
    });

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching referrers found for this company'
      });
    }

    // Return top match
    const bestMatch = matches[0];

    res.json({
      success: true,
      referrer: bestMatch.referrer,
      matchScore: bestMatch.matchScore,
      skillMatch: bestMatch.skillMatch,
      experienceMatch: bestMatch.experienceMatch
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
