import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import escrowService from '../services/enhancedEscrowService';
import EscrowTransaction from '../models/EscrowTransaction';

// Get escrow details
export const getEscrowDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const escrow = await EscrowTransaction.findOne({ referralId })
      .populate('seekerId', 'name email')
      .populate('referrerId', 'name email')
      .populate('approvedBy', 'name email');

    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    res.json({ success: true, escrow });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's escrow transactions
export const getUserEscrows = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { role } = req.query;

    const filter: any = {};
    if (role === 'seeker') {
      filter.seekerId = userId;
    } else if (role === 'referrer') {
      filter.referrerId = userId;
    } else {
      filter.$or = [{ seekerId: userId }, { referrerId: userId }];
    }

    const escrows = await EscrowTransaction.find(filter)
      .populate('seekerId', 'name email')
      .populate('referrerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: escrows.length, escrows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// File dispute
export const fileDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.userId;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Dispute reason required' });
    }

    const escrow = await escrowService.fileDispute(referralId, userId!, reason);

    res.json({
      success: true,
      message: 'Dispute filed successfully',
      escrow
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resolve dispute (admin only)
export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const { resolution, action } = req.body; // action: 'release' or 'refund'
    const adminId = req.user?.userId;

    const escrow = await EscrowTransaction.findOne({ referralId });
    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    if (!escrow.dispute) {
      return res.status(400).json({ success: false, message: 'No dispute found' });
    }

    // Update dispute
    escrow.dispute.status = 'RESOLVED';
    escrow.dispute.resolution = resolution;
    escrow.dispute.resolvedAt = new Date();
    escrow.dispute.resolvedBy = adminId as any;

    // Execute action
    if (action === 'release') {
      await escrowService.releaseFunds(referralId, adminId);
    } else if (action === 'refund') {
      await escrowService.refundFunds(referralId, resolution);
    }

    await escrow.save();

    res.json({
      success: true,
      message: `Dispute resolved - ${action}`,
      escrow
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve escrow (admin only)
export const approveEscrow = async (req: AuthRequest, res: Response) => {
  try {
    const { referralId } = req.params;
    const adminId = req.user?.userId;

    const escrow = await escrowService.approveEscrow(referralId, adminId!);

    res.json({
      success: true,
      message: 'Escrow approved',
      escrow
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending approvals (admin only)
export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const escrows = await EscrowTransaction.find({
      status: 'PENDING_APPROVAL'
    })
      .populate('seekerId', 'name email')
      .populate('referrerId', 'name email')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: escrows.length, escrows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get flagged transactions (admin only)
export const getFlaggedTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const escrows = await EscrowTransaction.find({
      'fraudCheck.status': { $in: ['SUSPICIOUS', 'FLAGGED'] }
    })
      .populate('seekerId', 'name email')
      .populate('referrerId', 'name email')
      .sort({ 'fraudCheck.score': -1 });

    res.json({ success: true, count: escrows.length, escrows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get disputes (admin only)
export const getDisputes = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = { status: 'DISPUTED' };
    
    if (status) {
      filter['dispute.status'] = status;
    }

    const escrows = await EscrowTransaction.find(filter)
      .populate('seekerId', 'name email')
      .populate('referrerId', 'name email')
      .populate('dispute.filedBy', 'name email')
      .sort({ 'dispute.filedAt': -1 });

    res.json({ success: true, count: escrows.length, escrows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get escrow statistics (admin only)
export const getEscrowStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await EscrowTransaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          platformFees: { $sum: '$platformFee' }
        }
      }
    ]);

    const fraudStats = await EscrowTransaction.aggregate([
      {
        $group: {
          _id: '$fraudCheck.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byFraudStatus: fraudStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
