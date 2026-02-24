import Withdrawal from '../models/Withdrawal';
import Wallet from '../models/Wallet';
import mongoose from 'mongoose';

const MIN_WITHDRAWAL_AMOUNT = 100; // Minimum ₹100

// Request withdrawal
export const requestWithdrawal = async (
  userId: string,
  amount: number,
  method: 'bank_transfer' | 'upi' | 'paypal',
  accountDetails: any
): Promise<any> => {
  // Validate amount
  if (amount < MIN_WITHDRAWAL_AMOUNT) {
    throw new Error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`);
  }

  // Check wallet balance
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.freeBalance < amount) {
    throw new Error(`Insufficient balance. Available: ₹${wallet.freeBalance}`);
  }

  // Check pending withdrawals
  const pendingWithdrawals = await Withdrawal.countDocuments({
    userId,
    status: { $in: ['PENDING', 'APPROVED', 'PROCESSING'] }
  });

  if (pendingWithdrawals > 0) {
    throw new Error('You have a pending withdrawal. Please wait for it to complete.');
  }

  // Create withdrawal request
  const withdrawal = await Withdrawal.create({
    userId,
    amount,
    method,
    accountDetails,
    status: 'PENDING',
    requestedAt: new Date()
  });

  console.log(`📤 Withdrawal requested: ₹${amount} by user ${userId}`);
  return withdrawal;
};

// Approve withdrawal (admin)
export const approveWithdrawal = async (withdrawalId: string, adminId: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== 'PENDING') throw new Error('Withdrawal not pending');

    // Lock funds in wallet
    const wallet = await Wallet.findOne({ userId: withdrawal.userId }).session(session);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.freeBalance < withdrawal.amount) {
      throw new Error('Insufficient balance');
    }

    wallet.freeBalance -= withdrawal.amount;
    wallet.lockedBalance += withdrawal.amount;
    wallet.transactions.push({
      type: 'LOCK',
      amount: withdrawal.amount,
      description: `Withdrawal approved - funds locked`,
      status: 'COMPLETED',
      createdAt: new Date()
    } as any);
    await wallet.save({ session });

    // Update withdrawal
    withdrawal.status = 'APPROVED';
    withdrawal.approvedAt = new Date();
    withdrawal.approvedBy = new mongoose.Types.ObjectId(adminId);
    await withdrawal.save({ session });

    await session.commitTransaction();
    
    console.log(`✅ Withdrawal approved: ${withdrawalId}`);
    return withdrawal;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Complete withdrawal (after payment processed)
export const completeWithdrawal = async (withdrawalId: string, transactionId: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId).session(session);
    if (!withdrawal) throw new Error('Withdrawal not found');
    if (withdrawal.status !== 'APPROVED' && withdrawal.status !== 'PROCESSING') {
      throw new Error('Withdrawal not approved');
    }

    // Deduct from wallet
    const wallet = await Wallet.findOne({ userId: withdrawal.userId }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    wallet.totalBalance -= withdrawal.amount;
    wallet.lockedBalance -= withdrawal.amount;
    wallet.transactions.push({
      type: 'WITHDRAW',
      amount: withdrawal.amount,
      description: `Withdrawal completed - ${withdrawal.method}`,
      status: 'COMPLETED',
      createdAt: new Date()
    } as any);
    await wallet.save({ session });

    // Update withdrawal
    withdrawal.status = 'COMPLETED';
    withdrawal.completedAt = new Date();
    withdrawal.transactionId = transactionId;
    await withdrawal.save({ session });

    await session.commitTransaction();
    
    console.log(`✅ Withdrawal completed: ${withdrawalId}`);
    return withdrawal;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Reject withdrawal
export const rejectWithdrawal = async (withdrawalId: string, adminId: string, reason: string): Promise<any> => {
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) throw new Error('Withdrawal not found');
  if (withdrawal.status !== 'PENDING') throw new Error('Withdrawal not pending');

  withdrawal.status = 'REJECTED';
  withdrawal.rejectionReason = reason;
  withdrawal.approvedBy = new mongoose.Types.ObjectId(adminId);
  await withdrawal.save();

  console.log(`❌ Withdrawal rejected: ${withdrawalId}`);
  return withdrawal;
};

// Get user withdrawals
export const getUserWithdrawals = async (userId: string): Promise<any[]> => {
  return await Withdrawal.find({ userId }).sort({ createdAt: -1 });
};

// Get pending withdrawals (admin)
export const getPendingWithdrawals = async (): Promise<any[]> => {
  return await Withdrawal.find({ status: 'PENDING' })
    .populate('userId', 'name email')
    .sort({ requestedAt: 1 });
};

export default {
  requestWithdrawal,
  approveWithdrawal,
  completeWithdrawal,
  rejectWithdrawal,
  getUserWithdrawals,
  getPendingWithdrawals
};
