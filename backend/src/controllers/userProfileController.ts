import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import UserProfile from '../models/UserProfile';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      return res.json({ success: true, profile: null });
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrUpdateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profileData = {
      userId,
      personalInfo: req.body.personalInfo,
      professionalInfo: req.body.professionalInfo,
      technicalSkills: req.body.technicalSkills || [],
      softSkills: req.body.softSkills || [],
      certifications: req.body.certifications || [],
      education: req.body.education || [],
      workExperience: req.body.workExperience || [],
      links: req.body.links,
      resumeUrl: req.body.resumeUrl,
      bio: req.body.bio
    };

    let profile = await UserProfile.findOne({ userId });
    
    if (profile) {
      Object.assign(profile, profileData);
    } else {
      profile = new UserProfile(profileData);
    }
    
    await profile.save();

    res.json({ 
      success: true, 
      message: 'Profile saved successfully',
      profile,
      completeness: profile.completeness
    });
  } catch (error: any) {
    console.error('Save profile error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    await UserProfile.findOneAndDelete({ userId });
    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error: any) {
    console.error('Delete profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
