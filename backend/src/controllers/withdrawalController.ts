import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import withdrawalService from '../services/withdrawalService';

// Request withdrawal
export const requestWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { amount, method, accountDetails } = req.body;

    if (!amount || !method || !accountDetails) {
      return res.status(400).json({
        success: false,
        message: 'Amount, method, and account details required'
      });
    }

    const withdrawal = await withdrawalService.requestWithdrawal(
      userId!,
      amount,
      method,
      accountDetails
    );

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      withdrawal
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get user withdrawals
export const getUserWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const withdrawals = await withdrawalService.getUserWithdrawals(userId!);

    res.json({ success: true, count: withdrawals.length, withdrawals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve withdrawal (admin)
export const approveWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { withdrawalId } = req.params;
    const adminId = req.user?.userId;

    const withdrawal = await withdrawalService.approveWithdrawal(withdrawalId, adminId!);

    res.json({
      success: true,
      message: 'Withdrawal approved',
      withdrawal
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Complete withdrawal (admin)
export const completeWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { withdrawalId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID required'
      });
    }

    const withdrawal = await withdrawalService.completeWithdrawal(withdrawalId, transactionId);

    res.json({
      success: true,
      message: 'Withdrawal completed',
      withdrawal
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Reject withdrawal (admin)
export const rejectWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.userId;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason required'
      });
    }

    const withdrawal = await withdrawalService.rejectWithdrawal(withdrawalId, adminId!, reason);

    res.json({
      success: true,
      message: 'Withdrawal rejected',
      withdrawal
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get pending withdrawals (admin)
export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await withdrawalService.getPendingWithdrawals();

    res.json({ success: true, count: withdrawals.length, withdrawals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
