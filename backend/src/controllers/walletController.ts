import { Request, Response } from 'express';
import walletService from '../services/walletService';

export const getWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const wallet = await walletService.getWallet(userId);
    
    res.json({
      success: true,
      wallet: {
        totalBalance: wallet.totalBalance,
        freeBalance: wallet.freeBalance,
        lockedBalance: wallet.lockedBalance,
        transactions: wallet.transactions.slice(-20).reverse() // Last 20 transactions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFunds = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, paymentId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // TODO: Verify Razorpay payment here
    
    const wallet = await walletService.addFunds(userId, amount, `Payment ID: ${paymentId}`);
    
    res.json({
      success: true,
      message: 'Funds added successfully',
      wallet: {
        totalBalance: wallet.totalBalance,
        freeBalance: wallet.freeBalance,
        lockedBalance: wallet.lockedBalance
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const wallet = await walletService.withdraw(userId, amount);
    
    res.json({
      success: true,
      message: 'Withdrawal successful. Funds will be credited within 24 hours.',
      wallet: {
        totalBalance: wallet.totalBalance,
        freeBalance: wallet.freeBalance,
        lockedBalance: wallet.lockedBalance
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const wallet = await walletService.getWallet(userId);
    
    res.json({
      success: true,
      transactions: wallet.transactions.reverse()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
