import mongoose from 'mongoose';
import Wallet from '../models/Wallet';
import Escrow from '../models/Escrow';

class WalletService {
  // Add money to wallet (FREE_BALANCE)
  async addFunds(userId: string, amount: number, description: string = 'Wallet top-up') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let wallet = await Wallet.findOne({ userId }).session(session);
      
      if (!wallet) {
        wallet = new Wallet({ 
          userId: new mongoose.Types.ObjectId(userId), 
          totalBalance: 0, 
          freeBalance: 0, 
          lockedBalance: 0, 
          transactions: [] 
        });
      }

      wallet.totalBalance += amount;
      wallet.freeBalance += amount;
      wallet.transactions.push({
        type: 'ADD',
        amount,
        description,
        status: 'COMPLETED',
        createdAt: new Date()
      });

      await wallet.save({ session });
      await session.commitTransaction();
      
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Withdraw from free balance (one-click, no approval)
  async withdraw(userId: string, amount: number) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const wallet = await Wallet.findOne({ userId }).session(session);
      
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.freeBalance < amount) throw new Error('Insufficient free balance');

      wallet.totalBalance -= amount;
      wallet.freeBalance -= amount;
      wallet.transactions.push({
        type: 'WITHDRAW',
        amount,
        description: 'Withdrawal to bank account',
        status: 'COMPLETED',
        createdAt: new Date()
      });

      await wallet.save({ session });
      await session.commitTransaction();
      
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Lock funds into escrow (ONLY after referrer accepts)
  async lockFundsToEscrow(referralId: string, seekerId: string, referrerId: string, amount: number) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if escrow already exists (idempotency)
      const existingEscrow = await Escrow.findOne({ referralId }).session(session);
      if (existingEscrow) {
        await session.abortTransaction();
        return existingEscrow;
      }

      const wallet = await Wallet.findOne({ userId: seekerId }).session(session);
      
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.freeBalance < amount) throw new Error('Insufficient free balance');

      // Move from free to locked
      wallet.freeBalance -= amount;
      wallet.lockedBalance += amount;
      wallet.transactions.push({
        type: 'LOCK',
        amount,
        description: 'Funds locked in escrow',
        referralId: new mongoose.Types.ObjectId(referralId),
        status: 'COMPLETED',
        createdAt: new Date()
      });

      // Create escrow
      const escrow = new Escrow({
        referralId,
        seekerId,
        referrerId,
        amount,
        status: 'LOCKED'
      });

      await wallet.save({ session });
      await escrow.save({ session });
      await session.commitTransaction();
      
      return escrow;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Release escrow to referrer (on completion)
  async releaseEscrow(referralId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const escrow = await Escrow.findOne({ referralId }).session(session);
      
      if (!escrow) throw new Error('Escrow not found');
      if (escrow.status !== 'LOCKED') throw new Error('Escrow already processed');

      const seekerWallet = await Wallet.findOne({ userId: escrow.seekerId }).session(session);
      let referrerWallet = await Wallet.findOne({ userId: escrow.referrerId }).session(session);

      if (!seekerWallet) throw new Error('Seeker wallet not found');
      
      if (!referrerWallet) {
        referrerWallet = new Wallet({ 
          userId: new mongoose.Types.ObjectId(escrow.referrerId), 
          totalBalance: 0, 
          freeBalance: 0, 
          lockedBalance: 0, 
          transactions: [] 
        });
      }

      // Unlock from seeker
      seekerWallet.totalBalance -= escrow.amount;
      seekerWallet.lockedBalance -= escrow.amount;
      seekerWallet.transactions.push({
        type: 'RELEASE',
        amount: escrow.amount,
        description: 'Escrow released to referrer',
        referralId: new mongoose.Types.ObjectId(referralId),
        escrowId: escrow._id as mongoose.Types.ObjectId,
        status: 'COMPLETED',
        createdAt: new Date()
      });

      // Add to referrer
      referrerWallet.totalBalance += escrow.amount;
      referrerWallet.freeBalance += escrow.amount;
      referrerWallet.transactions.push({
        type: 'ADD',
        amount: escrow.amount,
        description: 'Referral payment received',
        referralId: new mongoose.Types.ObjectId(referralId),
        escrowId: escrow._id as mongoose.Types.ObjectId,
        status: 'COMPLETED',
        createdAt: new Date()
      });

      escrow.status = 'RELEASED';
      escrow.releasedAt = new Date();

      await seekerWallet.save({ session });
      await referrerWallet.save({ session });
      await escrow.save({ session });
      await session.commitTransaction();
      
      return escrow;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Refund escrow to seeker (on rejection/expiry)
  async refundEscrow(referralId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const escrow = await Escrow.findOne({ referralId }).session(session);
      
      if (!escrow) throw new Error('Escrow not found');
      if (escrow.status !== 'LOCKED') throw new Error('Escrow already processed');

      const wallet = await Wallet.findOne({ userId: escrow.seekerId }).session(session);
      
      if (!wallet) throw new Error('Wallet not found');

      // Unlock back to free balance
      wallet.lockedBalance -= escrow.amount;
      wallet.freeBalance += escrow.amount;
      wallet.transactions.push({
        type: 'REFUND',
        amount: escrow.amount,
        description: 'Escrow refunded',
        referralId: new mongoose.Types.ObjectId(referralId),
        escrowId: escrow._id as mongoose.Types.ObjectId,
        status: 'COMPLETED',
        createdAt: new Date()
      });

      escrow.status = 'REFUNDED';
      escrow.releasedAt = new Date();

      await wallet.save({ session });
      await escrow.save({ session });
      await session.commitTransaction();
      
      return escrow;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Get wallet details
  async getWallet(userId: string) {
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = new Wallet({ 
        userId: new mongoose.Types.ObjectId(userId), 
        totalBalance: 0, 
        freeBalance: 0, 
        lockedBalance: 0, 
        transactions: [] 
      });
      await wallet.save();
    }
    
    return wallet;
  }

  // Get escrow details
  async getEscrow(referralId: string) {
    return await Escrow.findOne({ referralId });
  }
}

export default new WalletService();
