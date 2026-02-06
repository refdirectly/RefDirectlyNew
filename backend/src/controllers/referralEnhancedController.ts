import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ReferralEnhanced from '../models/ReferralEnhanced';
import User from '../models/User';
import ReferralChat from '../models/ReferralChat';
import notificationService from '../services/notificationService';
import { io } from '../server';

// Create referral request
export const createReferralEnhanced = async (req: AuthRequest, res: Response) => {
  try {
    const { referrerId, company, role, reward, message, seekerProfile } = req.body;
    const seekerId = req.user?.userId;

    const referral = new ReferralEnhanced({
      seekerId,
      referrerId,
      company,
      role,
      reward,
      message,
      seekerProfile
    });

    await referral.save();

    // Notify referrer
    if (referrerId) {
      const seeker = await User.findById(seekerId);
      await notificationService.create({
        recipientUserId: referrerId,
        recipientRole: 'referrer',
        title: '🤝 New Referral Request',
        message: `${seeker?.name} requested referral for ${role} at ${company}`,
        type: 'application',
        entityId: referral._id.toString()
      });
    }

    res.status(201).json({ success: true, referral });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept referral - AUTO-ASSIGN HR
export const acceptReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const referrerId = req.user?.userId;

    const referral = await ReferralEnhanced.findById(id).populate('seekerId');
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Referral already processed' });
    }

    // Find active HR from same company
    const companyHR = await User.findOne({
      role: 'company_hr',
      $or: [{ company: referral.company }, { currentCompany: referral.company }],
      isActive: true
    }).sort({ lastSeenAt: -1 });

    referral.status = 'accepted';
    referral.acceptedAt = new Date();
    
    if (companyHR) {
      referral.companyHRId = companyHR._id as any;
      referral.hrChatEnabled = true;

      // Create HR chat room
      const chat = new ReferralChat({
        referralId: referral._id,
        seekerId: referral.seekerId,
        hrId: companyHR._id,
        company: referral.company
      });
      await chat.save();

      // Notify HR
      await notificationService.create({
        recipientUserId: companyHR._id.toString(),
        recipientRole: 'company_hr' as any,
        title: '👤 New Candidate Assigned',
        message: `${(referral.seekerId as any).name} for ${referral.role} position`,
        type: 'application',
        entityId: referral._id.toString()
      });
    }

    await referral.save();

    // Notify seeker
    await notificationService.create({
      recipientUserId: (referral.seekerId as any)._id.toString(),
      recipientRole: 'seeker',
      title: '🎉 Referral Accepted!',
      message: `Your referral for ${referral.role} at ${referral.company} was accepted${companyHR ? '. You can now chat with company HR!' : ''}`,
      type: 'status_update',
      entityId: referral._id.toString()
    });

    res.json({ success: true, referral });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get HR's assigned referrals
export const getHRReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const hrId = req.user?.userId;
    const user = await User.findById(hrId);

    if (user?.role !== 'company_hr') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const referrals = await ReferralEnhanced.find({
      companyHRId: hrId,
      status: { $in: ['accepted', 'completed'] }
    })
      .populate('seekerId', 'name email avatarUrl')
      .populate('referrerId', 'name')
      .sort({ acceptedAt: -1 });

    res.json({ success: true, referrals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get seeker's referrals with HR chat status
export const getSeekerReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const seekerId = req.user?.userId;

    const referrals = await ReferralEnhanced.find({ seekerId })
      .populate('referrerId', 'name companies')
      .populate('companyHRId', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, referrals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start HR chat (seeker side)
export const startHRChat = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.body;
    const seekerId = req.user?.userId;

    const referral = await ReferralEnhanced.findById(referralId);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    if (referral.seekerId.toString() !== seekerId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!referral.hrChatEnabled) {
      return res.status(403).json({ success: false, message: 'HR chat not available yet' });
    }

    let chat = await ReferralChat.findOne({ referralId })
      .populate('seekerId', 'name avatarUrl')
      .populate('hrId', 'name avatarUrl company');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.json({ success: true, chat });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message in HR chat
export const sendHRChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId, content } = req.body;
    const senderId = req.user?.userId;

    const chat = await ReferralChat.findOne({ referralId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Verify sender is participant
    if (chat.seekerId.toString() !== senderId && chat.hrId.toString() !== senderId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const message = {
      senderId,
      content,
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(message as any);
    chat.lastMessageAt = new Date();
    await chat.save();

    // Emit via Socket.IO
    const roomName = `referral_hr_${referralId}`;
    const lastMessage = chat.messages[chat.messages.length - 1];
    io.to(roomName).emit('hr_chat_message', {
      referralId,
      message: {
        ...message,
        _id: (lastMessage as any)._id
      }
    });

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get HR chat messages
export const getHRChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const userId = req.user?.userId;

    const chat = await ReferralChat.findOne({ referralId })
      .populate('messages.senderId', 'name avatarUrl');

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Verify access
    if (chat.seekerId.toString() !== userId && chat.hrId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, messages: chat.messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get HR's active chats
export const getHRChats = async (req: AuthRequest, res: Response) => {
  try {
    const hrId = req.user?.userId;

    const chats = await ReferralChat.find({ hrId })
      .populate('seekerId', 'name email avatarUrl')
      .populate('referralId', 'company role status')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, chats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
