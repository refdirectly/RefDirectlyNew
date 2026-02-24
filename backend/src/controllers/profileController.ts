import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Profile from '../models/Profile';
import User from '../models/User';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

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
          technical: Array.isArray(user.skills) ? user.skills : [],
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
        bio: user.bio || ''
      });
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch profile' 
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Create clean data object
    const updateData: any = {};

    if (req.body.personalInfo) {
      updateData.personalInfo = req.body.personalInfo;
    }

    if (req.body.professionalInfo) {
      updateData.professionalInfo = req.body.professionalInfo;
    }

    console.log('=== RECEIVED REQUEST ===');
    console.log('req.body.skills:', JSON.stringify(req.body.skills));
    console.log('Type:', typeof req.body.skills);
    console.log('Is Array:', Array.isArray(req.body.skills));

    // CRITICAL: Handle skills as object with arrays
    if (req.body.skills) {
      updateData.skills = {
        technical: Array.isArray(req.body.skills.technical) ? req.body.skills.technical : [],
        soft: Array.isArray(req.body.skills.soft) ? req.body.skills.soft : [],
        certifications: Array.isArray(req.body.skills.certifications) ? req.body.skills.certifications : []
      };
    }

    if (req.body.education) {
      updateData.education = Array.isArray(req.body.education) ? req.body.education : [];
    }

    if (req.body.workExperience) {
      updateData.workExperience = Array.isArray(req.body.workExperience) ? req.body.workExperience : [];
    }

    if (req.body.links) {
      updateData.links = req.body.links;
    }

    if (req.body.documents) {
      updateData.documents = req.body.documents;
    }

    if (req.body.bio !== undefined) {
      updateData.bio = req.body.bio;
    }

    updateData.lastUpdated = new Date();

    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      profile = new Profile({ userId, ...updateData });
      await profile.save();
    } else {
      Object.assign(profile, updateData);
      await profile.save();
    }

    // Sync to User model
    await User.findByIdAndUpdate(userId, {
      name: updateData.personalInfo?.name,
      phone: updateData.personalInfo?.phone,
      currentTitle: updateData.professionalInfo?.currentTitle,
      currentCompany: updateData.professionalInfo?.currentCompany,
      experience: updateData.professionalInfo?.totalExperience,
      skills: updateData.skills?.technical,
      linkedinUrl: updateData.links?.linkedinUrl,
      bio: updateData.bio
    });

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile,
      completeness: profile.profileCompleteness
    });
  } catch (error: any) {
    console.error('Update profile error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to update profile' 
    });
  }
};

export const getProfileCompleteness = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profile = await Profile.findOne({ userId });
    res.json({ success: true, completeness: profile?.profileCompleteness || 0 });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to get completeness' 
    });
  }
};

export const searchProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const { skills, minExp, maxExp } = req.query;

    let profiles;
    if (skills) {
      const skillArray = (skills as string).split(',').map(s => s.trim());
      profiles = await Profile.find({
        'skills.technical': { $in: skillArray }
      }).limit(10);
    } else if (minExp && maxExp) {
      profiles = await Profile.find({
        'professionalInfo.totalExperience': { 
          $gte: parseInt(minExp as string), 
          $lte: parseInt(maxExp as string) 
        }
      }).limit(10);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide skills or experience range' 
      });
    }

    res.json({ success: true, count: profiles.length, profiles });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to search profiles' 
    });
  }
};
