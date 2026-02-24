import User from '../models/User';

interface MatchingCriteria {
  company: string;
  requiredSkills?: string[];
  experienceLevel?: number;
  location?: string;
}

interface ReferrerMatch {
  referrer: any;
  matchScore: number;
  skillMatch: number;
  experienceMatch: boolean;
  companyMatch: boolean;
}

// Calculate skill similarity score (0-100)
const calculateSkillSimilarity = (requiredSkills: string[], referrerSkills: string[]): number => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!referrerSkills || referrerSkills.length === 0) return 0;

  const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());
  const normalizedReferrer = referrerSkills.map(s => s.toLowerCase().trim());

  const matchedSkills = normalizedRequired.filter(skill =>
    normalizedReferrer.some(rs => rs.includes(skill) || skill.includes(rs))
  );

  return Math.round((matchedSkills.length / normalizedRequired.length) * 100);
};

// Check experience level match
const checkExperienceMatch = (required: number, referrerExp: number): boolean => {
  if (!required) return true;
  if (!referrerExp) return false;
  
  // Allow ±2 years flexibility
  return Math.abs(referrerExp - required) <= 2;
};

// Smart referral matching algorithm
export const findMatchingReferrers = async (criteria: MatchingCriteria): Promise<ReferrerMatch[]> => {
  const { company, requiredSkills, experienceLevel } = criteria;

  // Find all verified referrers for the company
  const referrers = await User.find({
    role: 'referrer',
    verified: true,
    'companies.name': { $regex: new RegExp(`^${company}$`, 'i') },
    'companies.verified': true
  }).select('name email companies pricePerReferral rating experience skills currentTitle avatarUrl bio');

  const matches: ReferrerMatch[] = referrers.map(referrer => {
    const skillMatch = calculateSkillSimilarity(requiredSkills || [], referrer.skills || []);
    const experienceMatch = checkExperienceMatch(experienceLevel || 0, referrer.experience || 0);
    const companyMatch = true; // Already filtered by company

    // Calculate overall match score (weighted)
    const matchScore = Math.round(
      (skillMatch * 0.6) + // 60% weight on skills
      (experienceMatch ? 30 : 0) + // 30% weight on experience
      (referrer.rating ? (referrer.rating / 5) * 10 : 0) // 10% weight on rating
    );

    return {
      referrer,
      matchScore,
      skillMatch,
      experienceMatch,
      companyMatch
    };
  });

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
};

// Get top N referrers for a job
export const getTopReferrersForJob = async (
  company: string,
  skills: string[],
  experience: number,
  limit: number = 10
): Promise<ReferrerMatch[]> => {
  const matches = await findMatchingReferrers({ company, requiredSkills: skills, experienceLevel: experience });
  return matches.slice(0, limit);
};

// Get referrer availability
export const getReferrerAvailability = async (referrerId: string): Promise<{
  available: boolean;
  activeReferrals: number;
  maxCapacity: number;
}> => {
  const Referral = require('../models/Referral').default;
  
  const activeReferrals = await Referral.countDocuments({
    referrerId,
    status: { $in: ['requested', 'accepted', 'submitted', 'interview'] }
  });

  const maxCapacity = 10; // Default max capacity
  const available = activeReferrals < maxCapacity;

  return { available, activeReferrals, maxCapacity };
};
