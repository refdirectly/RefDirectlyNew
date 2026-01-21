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
    const { amount, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Missing payment details.' });
    }

    // Verify Razorpay payment signature
    const crypto = require('crypto');
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    
    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }
    
    const wallet = await walletService.addFunds(userId, amount, `Razorpay Payment: ${razorpay_payment_id}`);
    
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
