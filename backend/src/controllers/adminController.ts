import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Referral from '../models/Referral';
import Application from '../models/Application';
import emailAutomationService from '../services/emailAutomationService';
import { logger } from '../utils/logger';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, role, verified, search } = req.query;
    const query: any = {};
    
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({ 
      success: true, 
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const getAllReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }
    
    const referrals = await Referral.find(query)
      .populate('seekerId', 'name email')
      .populate('referrerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Referral.countDocuments(query);
    
    res.json({ 
      success: true, 
      referrals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch referrals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch referrals' });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status, aiGenerated } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    if (aiGenerated !== undefined) query.aiGenerated = aiGenerated === 'true';
    
    const applications = await Application.find(query)
      .populate('seekerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Application.countDocuments(query);
    
    res.json({ 
      success: true, 
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch applications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

export const verifyUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { verified: true }, { new: true });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Send verification email
    try {
      await emailAutomationService.sendSimpleEmail({
        to: user.email,
        subject: 'Account Verified',
        html: `<h2>Congratulations!</h2><p>Your account has been verified by our admin team.</p>`
      });
    } catch (emailError) {
      logger.warn('Failed to send verification email:', emailError);
    }
    
    res.json({ success: true, message: 'User verified successfully', user });
  } catch (error: any) {
    logger.error('Failed to verify user:', error);
    res.status(500).json({ success: false, message: 'Failed to verify user' });
  }
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId, 
      { verified: false, suspended: true, suspensionReason: reason },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Send suspension email
    try {
      await emailAutomationService.sendSimpleEmail({
        to: user.email,
        subject: 'Account Suspended',
        html: `<h2>Account Suspended</h2><p>Your account has been suspended. ${reason ? `Reason: ${reason}` : ''}</p>`
      });
    } catch (emailError) {
      logger.warn('Failed to send suspension email:', emailError);
    }
    
    res.json({ success: true, message: 'User suspended successfully', user });
  } catch (error: any) {
    logger.error('Failed to suspend user:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Delete related data
    await Promise.all([
      Referral.deleteMany({ $or: [{ seekerId: userId }, { referrerId: userId }] }),
      Application.deleteMany({ seekerId: userId })
    ]);
    
    res.json({ success: true, message: 'User and related data deleted successfully' });
  } catch (error: any) {
    logger.error('Failed to delete user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalReferrals, totalApplications] = await Promise.all([
      User.countDocuments(),
      Referral.countDocuments(),
      Application.countDocuments()
    ]);

    const referrers = await User.countDocuments({ role: 'referrer' });
    const seekers = await User.countDocuments({ role: 'seeker' });
    const pendingReferrals = await Referral.countDocuments({ status: 'pending' });
    const completedReferrals = await Referral.countDocuments({ status: 'completed' });
    const acceptedReferrals = await Referral.countDocuments({ status: 'accepted' });
    const verifiedUsers = await User.countDocuments({ verified: true });
    const aiApplications = await Application.countDocuments({ aiGenerated: true });

    // Get recent activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt');
    const recentReferrals = await Referral.find().sort({ createdAt: -1 }).limit(5)
      .populate('seekerId', 'name')
      .populate('referrerId', 'name');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalReferrers: referrers,
        totalSeekers: seekers,
        totalReferrals,
        pendingReferrals,
        completedReferrals,
        acceptedReferrals,
        totalApplications,
        aiApplications,
        verifiedUsers,
        totalRevenue: completedReferrals * 5000,
        platformFee: completedReferrals * 500,
        conversionRate: totalReferrals > 0 ? ((completedReferrals / totalReferrals) * 100).toFixed(2) : 0
      },
      recentActivity: {
        users: recentUsers,
        referrals: recentReferrals
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

export const updateReferralStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const { status, notes } = req.body;
    
    const referral = await Referral.findByIdAndUpdate(
      referralId, 
      { status, adminNotes: notes, updatedAt: new Date() },
      { new: true }
    ).populate('seekerId referrerId', 'name email');
    
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    
    // Send notification emails
    try {
      const seeker = referral.seekerId as any;
      const referrer = referral.referrerId as any;
      
      await Promise.all([
        emailAutomationService.sendSimpleEmail({
          to: seeker.email,
          subject: `Referral Status Updated: ${status}`,
          html: `<h2>Referral Update</h2><p>Your referral status has been updated to: <strong>${status}</strong></p>`
        }),
        emailAutomationService.sendSimpleEmail({
          to: referrer.email,
          subject: `Referral Status Updated: ${status}`,
          html: `<h2>Referral Update</h2><p>The referral status has been updated to: <strong>${status}</strong></p>`
        })
      ]);
    } catch (emailError) {
      logger.warn('Failed to send status update emails:', emailError);
    }
    
    res.json({ success: true, message: 'Referral status updated', referral });
  } catch (error: any) {
    logger.error('Failed to update referral:', error);
    res.status(500).json({ success: false, message: 'Failed to update referral' });
  }
};

export const sendBulkEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { userIds, subject, message, role } = req.body;
    
    let users;
    if (userIds && userIds.length > 0) {
      users = await User.find({ _id: { $in: userIds } });
    } else if (role) {
      users = await User.find({ role });
    } else {
      users = await User.find();
    }
    
    const emailPromises = users.map(user => 
      emailAutomationService.sendSimpleEmail({
        to: user.email,
        subject,
        html: message
      }).catch(err => {
        logger.error(`Failed to send email to ${user.email}:`, err);
        return null;
      })
    );
    
    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r !== null).length;
    
    res.json({ 
      success: true, 
      message: `Emails sent: ${successful}/${users.length}`,
      sent: successful,
      total: users.length
    });
  } catch (error: any) {
    logger.error('Failed to send bulk emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
};

export const getAllPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query: any = {};
    
    if (status) query.status = status;
    else query.status = { $in: ['completed', 'accepted'] };
    
    const referrals = await Referral.find(query)
      .populate('referrerId', 'name email')
      .populate('seekerId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Referral.countDocuments(query);
    
    const payments = referrals.map(ref => ({
      _id: ref._id,
      referrer: ref.referrerId,
      seeker: ref.seekerId,
      amount: 5000,
      platformFee: 500,
      netAmount: 4500,
      company: ref.company,
      role: ref.role,
      status: ref.status,
      date: ref.updatedAt,
      createdAt: ref.createdAt
    }));
    
    const totalPaid = await Referral.countDocuments({ status: 'completed' });
    const totalPending = await Referral.countDocuments({ status: 'accepted' });
    
    res.json({ 
      success: true, 
      payments,
      summary: {
        totalPaid: totalPaid * 5000,
        totalPending: totalPending * 5000,
        platformRevenue: totalPaid * 500,
        transactionCount: totalPaid
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    // In production, save to database
    logger.info('System settings updated:', settings);
    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error: any) {
    logger.error('Failed to update settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

export const toggleMaintenanceMode = async (req: AuthRequest, res: Response) => {
  try {
    const { enabled } = req.body;
    // In production, save to database or config file
    logger.info(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    res.json({ success: true, maintenanceMode: enabled });
  } catch (error: any) {
    logger.error('Failed to toggle maintenance mode:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle maintenance mode' });
  }
};

export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    
    let data;
    switch (type) {
      case 'users':
        data = await User.find().select('-passwordHash');
        break;
      case 'referrals':
        data = await Referral.find().populate('seekerId referrerId', 'name email');
        break;
      case 'applications':
        data = await Application.find().populate('seekerId', 'name email');
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid export type' });
    }
    
    res.json({ success: true, data, count: data.length });
  } catch (error: any) {
    logger.error('Failed to export data:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
};

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const [userGrowth, referralGrowth, applicationGrowth] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Referral.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ createdAt: { $gte: startDate } })
    ]);
    
    res.json({
      success: true,
      analytics: {
        period,
        userGrowth,
        referralGrowth,
        applicationGrowth,
        startDate,
        endDate: new Date()
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
