import Profile from '../models/Profile';
import User from '../models/User';
import mongoose from 'mongoose';

// Sanitize input to prevent XSS
const sanitizeString = (str: string): string => {
  if (!str) return '';
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Get or create profile
export const getProfile = async (userId: string): Promise<any> => {
  try {
    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      profile = await Profile.create({
        userId,
        personalInfo: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: ''
        },
        professionalInfo: {
          currentTitle: user.currentTitle || '',
          currentCompany: user.currentCompany || '',
          totalExperience: user.experience || 0
        },
        skills: {
          technical: user.skills || [],
          soft: [],
          certifications: []
        },
        education: [],
        workExperience: [],
        links: {
          linkedinUrl: user.linkedinUrl || ''
        },
        documents: {
          resumeUrl: user.resumeUrl || ''
        },
        preferences: {},
        bio: user.bio || ''
      });
    }

    return profile;
  } catch (error) {
    throw error;
  }
};

// Update profile with validation
export const updateProfile = async (userId: string, data: any): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Sanitize all string inputs
    if (data.personalInfo) {
      if (data.personalInfo.name) data.personalInfo.name = sanitizeString(data.personalInfo.name);
      if (data.personalInfo.location) data.personalInfo.location = sanitizeString(data.personalInfo.location);
    }

    if (data.professionalInfo) {
      if (data.professionalInfo.currentTitle) {
        data.professionalInfo.currentTitle = sanitizeString(data.professionalInfo.currentTitle);
      }
      if (data.professionalInfo.currentCompany) {
        data.professionalInfo.currentCompany = sanitizeString(data.professionalInfo.currentCompany);
      }
    }

    // Validate URLs
    if (data.links) {
      if (data.links.linkedinUrl && !isValidUrl(data.links.linkedinUrl)) {
        throw new Error('Invalid LinkedIn URL');
      }
      if (data.links.githubUrl && !isValidUrl(data.links.githubUrl)) {
        throw new Error('Invalid GitHub URL');
      }
      if (data.links.portfolioUrl && !isValidUrl(data.links.portfolioUrl)) {
        throw new Error('Invalid Portfolio URL');
      }
    }

    // Validate skills array
    if (data.skills?.technical) {
      data.skills.technical = data.skills.technical
        .filter((s: string) => s && s.trim())
        .map((s: string) => sanitizeString(s))
        .slice(0, 50); // Max 50 skills
    }

    // Update profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true, session, runValidators: true }
    );

    // Sync important fields back to User model
    await User.findByIdAndUpdate(
      userId,
      {
        name: data.personalInfo?.name,
        phone: data.personalInfo?.phone,
        currentTitle: data.professionalInfo?.currentTitle,
        currentCompany: data.professionalInfo?.currentCompany,
        experience: data.professionalInfo?.totalExperience,
        skills: data.skills?.technical,
        linkedinUrl: data.links?.linkedinUrl,
        bio: data.bio
      },
      { session }
    );

    await session.commitTransaction();
    return profile;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get profile completeness
export const getProfileCompleteness = async (userId: string): Promise<number> => {
  const profile = await Profile.findOne({ userId });
  return profile?.profileCompleteness || 0;
};

// Search profiles by skills
export const searchProfilesBySkills = async (skills: string[], limit: number = 10): Promise<any[]> => {
  return await Profile.find({
    'skills.technical': { $in: skills }
  })
    .sort({ profileCompleteness: -1, lastUpdated: -1 })
    .limit(limit)
    .populate('userId', 'name email verified');
};

// Get profiles by experience range
export const getProfilesByExperience = async (minExp: number, maxExp: number): Promise<any[]> => {
  return await Profile.find({
    'professionalInfo.totalExperience': { $gte: minExp, $lte: maxExp }
  })
    .sort({ profileCompleteness: -1 })
    .populate('userId', 'name email');
};

export default {
  getProfile,
  updateProfile,
  getProfileCompleteness,
  searchProfilesBySkills,
  getProfilesByExperience
};
