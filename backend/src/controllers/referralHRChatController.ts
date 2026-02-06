import { Request, Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import Referral from '../models/Referral';
import CompanyHR from '../models/CompanyHR';

export const startReferralHRChat = async (req: Request, res: Response) => {
  try {
    const { referralId } = req.body;
    const seekerId = (req as any).user?.id || (req as any).user?.userId;

    if (!seekerId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    console.log('Starting HR chat - User ID:', seekerId, 'Referral ID:', referralId);

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    console.log('Referral seekerId:', referral.seekerId?.toString(), 'Current user:', seekerId);

    // Direct ObjectId comparison
    if (referral.seekerId?.toString() !== seekerId?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. This referral belongs to another user.' });
    }

    if (referral.status !== 'accepted') {
      return res.status(403).json({ success: false, message: 'Company HR chat is only available after referral is accepted' });
    }

    // Try to find company HR
    let companyHR = await CompanyHR.findOne({ 
      company: referral.company, 
      active: true 
    }).populate('hrId');

    // If no HR found, create a demo HR for testing
    if (!companyHR) {
      console.log(`No HR found for ${referral.company}, creating demo HR`);
      
      // Find or create a demo HR user
      const User = require('../models/User').default;
      const bcrypt = await import('bcryptjs');
      let demoHR = await User.findOne({ email: 'hr@demo.com', role: 'hr' });
      
      if (!demoHR) {
        demoHR = new User({
          name: `${referral.company} HR`,
          email: 'hr@demo.com',
          passwordHash: await bcrypt.hash('demo123', 10),
          role: 'hr',
          hrType: 'company',
          currentCompany: referral.company,
          currentTitle: 'HR Manager',
          verified: true
        });
        await demoHR.save();
      }

      // Create company HR mapping
      companyHR = new CompanyHR({
        company: referral.company,
        hrId: demoHR._id,
        active: true
      });
      await companyHR.save();
      companyHR = await CompanyHR.findById(companyHR._id).populate('hrId');
    }

    let chat = await Chat.findOne({ 
      type: 'referral_hr', 
      referralId 
    }).populate('participants', 'name avatarUrl').populate('referralId');

    if (!chat) {
      chat = new Chat({
        type: 'referral_hr',
        participants: [seekerId, companyHR.hrId],
        referralId
      });
      await chat.save();
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name avatarUrl')
        .populate('referralId');
    }

    console.log('Chat created successfully:', chat._id);
    res.json({ success: true, chat });
  } catch (error: any) {
    console.error('Start referral HR chat error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to start chat. Please try again.' });
  }
};

export const sendReferralHRMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, content } = req.body;
    const senderId = (req as any).user.id;

    const chat = await Chat.findById(chatId).populate('referralId');
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (chat.type !== 'referral_hr') {
      return res.status(400).json({ success: false, message: 'Invalid chat type' });
    }

    if (!chat.participants.some(p => p.toString() === senderId)) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    const referral = await Referral.findById(chat.referralId);
    if (referral?.status !== 'accepted') {
      return res.status(403).json({ success: false, message: 'Referral not accepted' });
    }

    const message = new Message({
      chatId,
      senderId,
      content
    });

    await message.save();

    chat.lastMessage = content;
    chat.lastMessageAt = new Date();
    await chat.save();

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReferralHRMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (!chat.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyReferralChats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const chats = await Chat.find({
      type: 'referral_hr',
      participants: userId
    })
      .populate('participants', 'name avatarUrl')
      .populate('referralId', 'company role status')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, chats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
