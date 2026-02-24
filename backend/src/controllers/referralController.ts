import { Response } from 'express';
import Referral from '../models/Referral';
import Job from '../models/Job';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import ReferralRequest from '../models/ReferralRequest';
import notificationService from '../services/notificationService';
import enhancedEscrowService from '../services/enhancedEscrowService';

export const createReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, referrerId, message, seekerProfile, reward, company, role } = req.body;
    const seekerId = req.user?.userId;

    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const referral = new Referral({
      jobId: jobId && isValidObjectId(jobId) ? jobId : undefined,
      seekerId,
      referrerId: referrerId && isValidObjectId(referrerId) ? referrerId : undefined,
      company: company || 'Unknown Company',
      role: role || 'Unknown Position',
      reward: reward || 99,
      message,
      seekerProfile
    });

    await referral.save();

    // Notify referrer about new request
    if (referrerId) {
      const seeker = await User.findById(seekerId);
      if (seeker) {
        await notificationService.create({
          recipientUserId: referrerId,
          recipientRole: 'referrer',
          title: '🤝 New Referral Request',
          message: `${seeker.name} requested a referral for ${role} at ${company} - Reward: ₹${reward || 99}`,
          type: 'application',
          entityId: referral._id.toString()
        });
      }
    }

    res.status(201).json({ success: true, referral });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create referral' });
  }
};

export const getReferralsBySeeker = async (req: AuthRequest, res: Response) => {
  try {
    const referrals = await Referral.find({ seekerId: req.user?.userId })
      .populate('jobId')
      .populate('referrerId', 'name email companies')
      .sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
};

export const getReferralsByReferrer = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    
    // If referrerId exists, filter by it, otherwise show all
    if (req.user?.userId) {
      filter.$or = [
        { referrerId: req.user.userId },
        { referrerId: null },
        { referrerId: { $exists: false } }
      ];
    }
    
    if (status) filter.status = status;

    const referrals = await Referral.find(filter)
      .populate('jobId')
      .populate('seekerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
};

export const createReferralWithPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, company, role, amount, message, seekerProfile, paymentDetails } = req.body;
    const seekerId = req.user?.userId;

    if (!seekerId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Validate payment details based on method
    if (!paymentDetails) {
      return res.status(400).json({ success: false, message: 'Payment details required' });
    }

    let qrCode = null;
    
    // Handle UPI payment
    if (paymentDetails.method === 'upi') {
      // Generate UPI QR code (using a simple UPI URL format)
      const upiId = '9555219911@ybl'; // Your UPI ID
      const upiUrl = `upi://pay?pa=${upiId}&pn=RefDirectly&am=${amount}&cu=INR&tn=Referral Payment for ${company}`;
      
      // In production, use a proper QR code library
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    }

    // Create referral request
    const referralRequest = new ReferralRequest({
      seekerId,
      company,
      role,
      message,
      seekerProfile,
      status: 'pending',
      amount
    });

    await referralRequest.save();

    const response: any = { 
      success: true, 
      referralRequest,
      message: paymentDetails.method === 'upi' ? 'UPI QR code generated. Complete payment to proceed.' : 'Referral request created successfully.'
    };

    if (qrCode) {
      response.qrCode = qrCode;
    }

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: error.message || 'Payment processing failed' });
  }
};

export const verifyUpiPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { referralRequestId, transactionId } = req.body;
    const seekerId = req.user?.userId;

    if (!seekerId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // In production, verify with actual UPI gateway
    // For demo, we'll simulate verification
    const isVerified = transactionId && transactionId.length > 5;

    if (isVerified) {
      // Update referral request status
      await ReferralRequest.findByIdAndUpdate(referralRequestId, {
        status: 'payment_verified'
      });

      res.json({ 
        success: true, 
        message: 'Payment verified successfully. Referrer will be notified.' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed. Please try again.' 
      });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

export const updateReferralStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const referralId = req.params.id;
    const updateData: any = { status };
    
    const referral = await Referral.findById(referralId).populate('seekerId referrerId');
    if (!referral) return res.status(404).json({ error: 'Referral not found' });
    
    // ESCROW LOCK: Only when referrer accepts
    if (status === 'accepted') {
      updateData.referrerId = req.user?.userId;
      updateData.acceptedAt = new Date();
      
      // Lock funds from seeker's wallet to escrow with fraud detection
      try {
        const metadata = {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          deviceId: req.get('x-device-id')
        };
        
        await enhancedEscrowService.lockFundsInEscrow(
          referralId,
          (referral.seekerId as any)._id.toString(),
          req.user?.userId!,
          referral.reward || 99,
          metadata
        );
      } catch (error: any) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot accept: ${error.message}` 
        });
      }

      // AUTO-ASSIGN COMPANY HR
      try {
        const companyHR = await User.findOne({
          role: 'company_hr',
          $or: [
            { company: referral.company },
            { currentCompany: referral.company }
          ],
          isActive: true
        }).sort({ lastSeenAt: -1 }); // Get most recently active HR

        if (companyHR) {
          updateData.companyHRId = companyHR._id;
          updateData.hrChatEnabled = true;
          console.log(`✅ Auto-assigned HR ${companyHR.name} to referral ${referralId}`);
        } else {
          console.log(`⚠️ No active HR found for company: ${referral.company}`);
        }
      } catch (hrError) {
        console.error('HR assignment error:', hrError);
        // Don't fail the acceptance if HR assignment fails
      }
    }
    
    // Update referral
    const updatedReferral = await Referral.findByIdAndUpdate(
      referralId,
      updateData,
      { new: true }
    ).populate('seekerId referrerId companyHRId');
    
    // Send notifications
    if (status === 'accepted' && updatedReferral!.seekerId) {
      const referrer = await User.findById(req.user?.userId);
      await notificationService.create({
        recipientUserId: (updatedReferral!.seekerId as any)._id.toString(),
        recipientRole: 'seeker',
        title: '🎉 Referral Accepted! Payment Secured',
        message: `${referrer?.name || 'A referrer'} accepted your request. ₹${updatedReferral!.reward} locked in escrow.${updatedReferral!.hrChatEnabled ? ' You can now chat with company HR!' : ''}`,
        type: 'status_update',
        entityId: updatedReferral!._id.toString()
      });
    } else if (status === 'rejected' && updatedReferral!.seekerId) {
      await notificationService.create({
        recipientUserId: (updatedReferral!.seekerId as any)._id.toString(),
        recipientRole: 'seeker',
        title: 'Referral Declined',
        message: `Your request for ${updatedReferral!.role} at ${updatedReferral!.company} was declined. No charges applied.`,
        type: 'status_update',
        entityId: updatedReferral!._id.toString()
      });
    } else if (status === 'completed') {
      // ESCROW RELEASE: Release funds to referrer (70/30 split)
      try {
        await enhancedEscrowService.releaseFunds(referralId);
      } catch (error: any) {
        console.error('Escrow release error:', error);
      }
      
      if (updatedReferral!.referrerId) {
        await notificationService.create({
          recipientUserId: (updatedReferral!.referrerId as any)._id.toString(),
          recipientRole: 'referrer',
          title: '💰 Payment Released!',
          message: `70% of ₹${updatedReferral!.reward} (₹${Math.round(updatedReferral!.reward * 0.7)}) credited to your wallet for ${updatedReferral!.role} referral.`,
          type: 'status_update',
          entityId: updatedReferral!._id.toString()
        });
      }
    } else if (status === 'rejected' && updatedReferral!.status === 'accepted') {
      // REFUND: If referral was accepted but then rejected
      try {
        await enhancedEscrowService.refundFunds(referralId, 'Referral rejected by referrer');
      } catch (error: any) {
        console.error('Refund error:', error);
      }
    }
    
    res.json(updatedReferral);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update referral' });
  }
};
