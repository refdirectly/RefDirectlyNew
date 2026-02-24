import EscrowTransaction from '../models/EscrowTransaction';
import Wallet from '../models/Wallet';
import User from '../models/User';
import mongoose from 'mongoose';

const PLATFORM_FEE_PERCENTAGE = 30; // 30% platform fee
const REFERRER_PERCENTAGE = 70; // 70% to referrer

// Fraud detection scoring
const calculateFraudScore = async (seekerId: string, amount: number, metadata: any): Promise<{ score: number; flags: string[] }> => {
  const flags: string[] = [];
  let score = 0;

  // Check user account age
  const user = await User.findById(seekerId);
  if (user) {
    const accountAge = Date.now() - user.createdAt.getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 1) {
      score += 30;
      flags.push('NEW_ACCOUNT');
    } else if (daysSinceCreation < 7) {
      score += 15;
      flags.push('RECENT_ACCOUNT');
    }
  }

  // Check transaction amount
  if (amount > 500) {
    score += 10;
    flags.push('HIGH_AMOUNT');
  }

  // Check multiple transactions in short time
  const recentTransactions = await EscrowTransaction.countDocuments({
    seekerId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  if (recentTransactions > 5) {
    score += 25;
    flags.push('MULTIPLE_TRANSACTIONS');
  } else if (recentTransactions > 3) {
    score += 15;
    flags.push('FREQUENT_TRANSACTIONS');
  }

  // Check IP address (if available)
  if (metadata?.ipAddress) {
    const sameIPCount = await EscrowTransaction.countDocuments({
      'metadata.ipAddress': metadata.ipAddress,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (sameIPCount > 10) {
      score += 20;
      flags.push('SHARED_IP');
    }
  }

  return { score, flags };
};

// Lock funds in escrow
export const lockFundsInEscrow = async (
  referralId: string,
  seekerId: string,
  referrerId: string,
  amount: number,
  metadata: any = {}
): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Calculate split
    const platformFee = Math.round((amount * PLATFORM_FEE_PERCENTAGE) / 100);
    const referrerAmount = amount - platformFee;

    // Fraud check
    const fraudCheck = await calculateFraudScore(seekerId, amount, metadata);
    const fraudStatus = fraudCheck.score > 50 ? 'FLAGGED' : fraudCheck.score > 25 ? 'SUSPICIOUS' : 'CLEAN';

    // Get or create seeker wallet
    let seekerWallet = await Wallet.findOne({ userId: seekerId }).session(session);
    if (!seekerWallet) {
      const newWallets = await Wallet.create([{ userId: seekerId, totalBalance: 0, freeBalance: 0, lockedBalance: 0 }], { session });
      seekerWallet = newWallets[0];
    }

    // Check sufficient balance
    if (seekerWallet.freeBalance < amount) {
      throw new Error(`Insufficient balance. Required: ₹${amount}, Available: ₹${seekerWallet.freeBalance}`);
    }

    // Lock funds in seeker wallet
    seekerWallet.freeBalance -= amount;
    seekerWallet.lockedBalance += amount;
    seekerWallet.transactions.push({
      type: 'LOCK',
      amount,
      description: `Funds locked for referral`,
      referralId: new mongoose.Types.ObjectId(referralId),
      status: 'COMPLETED',
      createdAt: new Date()
    } as any);
    await seekerWallet.save({ session });

    // Create escrow transaction
    const escrowStatus = fraudStatus === 'FLAGGED' ? 'PENDING_APPROVAL' : 'LOCKED';
    const escrow = await EscrowTransaction.create([{
      referralId,
      seekerId,
      referrerId,
      amount,
      platformFee,
      referrerAmount,
      status: escrowStatus,
      paymentMethod: 'wallet',
      fraudCheck: {
        score: fraudCheck.score,
        flags: fraudCheck.flags,
        checkedAt: new Date(),
        status: fraudStatus
      },
      metadata
    }], { session });

    await session.commitTransaction();
    
    console.log(`✅ Escrow created: ₹${amount} locked (Referrer: ₹${referrerAmount}, Platform: ₹${platformFee})`);
    
    return escrow[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Release funds to referrer (70/30 split)
export const releaseFunds = async (referralId: string, adminId?: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const escrow = await EscrowTransaction.findOne({ referralId }).session(session);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status === 'RELEASED') throw new Error('Funds already released');
    if (escrow.status === 'REFUNDED') throw new Error('Funds already refunded');
    if (escrow.status === 'DISPUTED') throw new Error('Cannot release disputed funds');

    // Check if admin approval required
    if (escrow.fraudCheck?.status === 'FLAGGED' && escrow.status !== 'APPROVED') {
      throw new Error('Admin approval required before release');
    }

    // Get seeker wallet
    const seekerWallet = await Wallet.findOne({ userId: escrow.seekerId }).session(session);
    if (!seekerWallet) throw new Error('Seeker wallet not found');

    // Unlock from seeker
    seekerWallet.lockedBalance -= escrow.amount;
    seekerWallet.transactions.push({
      type: 'RELEASE',
      amount: escrow.amount,
      description: `Funds released to referrer`,
      referralId: new mongoose.Types.ObjectId(referralId),
      escrowId: escrow._id,
      status: 'COMPLETED',
      createdAt: new Date()
    } as any);
    await seekerWallet.save({ session });

    // Get or create referrer wallet
    let referrerWallet = await Wallet.findOne({ userId: escrow.referrerId }).session(session);
    if (!referrerWallet) {
      const newWallets = await Wallet.create([{ userId: escrow.referrerId, totalBalance: 0, freeBalance: 0, lockedBalance: 0 }], { session });
      referrerWallet = newWallets[0];
    }

    // Credit referrer (70%)
    referrerWallet.totalBalance += escrow.referrerAmount;
    referrerWallet.freeBalance += escrow.referrerAmount;
    referrerWallet.transactions.push({
      type: 'ADD',
      amount: escrow.referrerAmount,
      description: `Referral payment received (70% of ₹${escrow.amount})`,
      referralId: new mongoose.Types.ObjectId(referralId),
      escrowId: escrow._id,
      status: 'COMPLETED',
      createdAt: new Date()
    } as any);
    await referrerWallet.save({ session });

    // Update escrow status
    escrow.status = 'RELEASED';
    escrow.releasedAt = new Date();
    if (adminId) escrow.approvedBy = new mongoose.Types.ObjectId(adminId);
    await escrow.save({ session });

    await session.commitTransaction();
    
    console.log(`✅ Funds released: ₹${escrow.referrerAmount} to referrer, ₹${escrow.platformFee} platform fee`);
    
    return escrow;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Refund to seeker
export const refundFunds = async (referralId: string, reason: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const escrow = await EscrowTransaction.findOne({ referralId }).session(session);
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status === 'RELEASED') throw new Error('Funds already released');
    if (escrow.status === 'REFUNDED') throw new Error('Funds already refunded');

    // Get seeker wallet
    const seekerWallet = await Wallet.findOne({ userId: escrow.seekerId }).session(session);
    if (!seekerWallet) throw new Error('Seeker wallet not found');

    // Refund to seeker
    seekerWallet.lockedBalance -= escrow.amount;
    seekerWallet.freeBalance += escrow.amount;
    seekerWallet.transactions.push({
      type: 'REFUND',
      amount: escrow.amount,
      description: `Refund: ${reason}`,
      referralId: new mongoose.Types.ObjectId(referralId),
      escrowId: escrow._id,
      status: 'COMPLETED',
      createdAt: new Date()
    } as any);
    await seekerWallet.save({ session });

    // Update escrow
    escrow.status = 'REFUNDED';
    escrow.refundedAt = new Date();
    await escrow.save({ session });

    await session.commitTransaction();
    
    console.log(`✅ Refund processed: ₹${escrow.amount} returned to seeker`);
    
    return escrow;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// File dispute
export const fileDispute = async (referralId: string, userId: string, reason: string): Promise<any> => {
  const escrow = await EscrowTransaction.findOne({ referralId });
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status === 'RELEASED') throw new Error('Cannot dispute released funds');
  if (escrow.status === 'REFUNDED') throw new Error('Cannot dispute refunded funds');

  escrow.status = 'DISPUTED';
  escrow.dispute = {
    reason,
    filedBy: new mongoose.Types.ObjectId(userId),
    filedAt: new Date(),
    status: 'OPEN'
  };
  await escrow.save();

  console.log(`⚠️ Dispute filed for referral ${referralId}`);
  return escrow;
};

// Approve escrow (admin only)
export const approveEscrow = async (referralId: string, adminId: string): Promise<any> => {
  const escrow = await EscrowTransaction.findOne({ referralId });
  if (!escrow) throw new Error('Escrow not found');
  if (escrow.status !== 'PENDING_APPROVAL' && escrow.status !== 'LOCKED') {
    throw new Error('Escrow not pending approval');
  }

  escrow.status = 'APPROVED';
  escrow.approvedAt = new Date();
  escrow.approvedBy = new mongoose.Types.ObjectId(adminId);
  await escrow.save();

  console.log(`✅ Escrow approved by admin ${adminId}`);
  return escrow;
};

export default {
  lockFundsInEscrow,
  releaseFunds,
  refundFunds,
  fileDispute,
  approveEscrow
};
