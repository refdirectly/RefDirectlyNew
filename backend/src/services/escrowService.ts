import EscrowTransaction from '../models/EscrowTransaction';
import Wallet from '../models/Wallet';

export const createEscrow = async (seekerId: string, referrerId: string, referralRequestId: string, amount: number) => {
  const expiryAt = new Date();
  expiryAt.setDate(expiryAt.getDate() + 3); // 3 days

  const escrow = await EscrowTransaction.create({
    seekerId,
    referrerId,
    referralId: referralRequestId,
    amount,
    platformFee: Math.round(amount * 0.3),
    referrerAmount: Math.round(amount * 0.7),
    status: 'LOCKED'
  });

  // Deduct from seeker wallet and add to escrow
  await Wallet.findOneAndUpdate(
    { userId: seekerId },
    { $inc: { freeBalance: -amount, lockedBalance: amount } },
    { upsert: true }
  );

  return escrow;
};

export const acceptEscrow = async (escrowId: string) => {
  return await EscrowTransaction.findByIdAndUpdate(
    escrowId,
    { status: 'APPROVED' },
    { new: true }
  );
};

export const completeEscrow = async (escrowId: string, proofUrl?: string) => {
  const escrow = await EscrowTransaction.findById(escrowId);
  if (!escrow) throw new Error('Escrow not found');

  // Release funds to referrer (70%)
  const referrerAmount = escrow.referrerAmount;
  
  await Wallet.findOneAndUpdate(
    { userId: escrow.referrerId },
    { $inc: { totalBalance: referrerAmount, freeBalance: referrerAmount } },
    { upsert: true }
  );

  // Remove from seeker escrow
  await Wallet.findOneAndUpdate(
    { userId: escrow.seekerId },
    { $inc: { lockedBalance: -escrow.amount } }
  );

  return await EscrowTransaction.findByIdAndUpdate(
    escrowId,
    { status: 'RELEASED', releasedAt: new Date() },
    { new: true }
  );
};

export const refundEscrow = async (escrowId: string) => {
  const escrow = await EscrowTransaction.findById(escrowId);
  if (!escrow) throw new Error('Escrow not found');

  // Refund to seeker
  await Wallet.findOneAndUpdate(
    { userId: escrow.seekerId },
    { $inc: { freeBalance: escrow.amount, lockedBalance: -escrow.amount } }
  );

  return await EscrowTransaction.findByIdAndUpdate(
    escrowId,
    { status: 'REFUNDED', refundedAt: new Date() },
    { new: true }
  );
};

export const checkExpiredEscrows = async () => {
  const expired = await EscrowTransaction.find({
    status: 'LOCKED',
    createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  });

  for (const escrow of expired) {
    await refundEscrow(escrow._id.toString());
  }

  return expired.length;
};
