import ReferralVerification from '../models/ReferralVerification';
import User from '../models/User';
import Referral from '../models/Referral';
import { logger } from '../utils/logger';
import notificationService from './notificationService';

export class PaymentProcessingService {
  private platformFeePercentage = 10; // 10% platform fee

  // Calculate payment breakdown
  calculatePayment(totalAmount: number): {
    totalAmount: number;
    platformFee: number;
    platformFeePercentage: number;
    referrerAmount: number;
  } {
    const platformFee = (totalAmount * this.platformFeePercentage) / 100;
    const referrerAmount = totalAmount - platformFee;

    return {
      totalAmount,
      platformFee: Math.round(platformFee * 100) / 100,
      platformFeePercentage: this.platformFeePercentage,
      referrerAmount: Math.round(referrerAmount * 100) / 100
    };
  }

  // Process payment after verification
  async processPayment(verificationId: string): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const verification = await ReferralVerification.findById(verificationId)
        .populate('seekerId referrerId');

      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.verificationStatus !== 'verified') {
        throw new Error('Referral not verified yet');
      }

      if (verification.payment.status === 'completed') {
        throw new Error('Payment already processed');
      }

      // Update payment status to processing
      verification.payment.status = 'processing';
      await verification.save();

      // Simulate payment processing (integrate with Stripe/PayPal here)
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In production, integrate with actual payment gateway:
      // const paymentResult = await stripe.transfers.create({
      //   amount: verification.payment.referrerAmount * 100,
      //   currency: 'usd',
      //   destination: referrer.stripeAccountId,
      // });

      // Update payment status
      verification.payment.status = 'completed';
      verification.payment.processedAt = new Date();
      verification.payment.transactionId = transactionId;
      
      // Add to timeline
      verification.timeline.push({
        stage: 'payment',
        status: 'completed',
        date: new Date(),
        notes: `Payment of $${verification.payment.referrerAmount} processed`,
        verifiedBy: 'admin'
      });

      await verification.save();

      // Update referral payment status
      await Referral.findByIdAndUpdate(verification.referralId, {
        paymentStatus: 'released'
      });

      // Send notifications
      await this.sendPaymentNotifications(verification);

      logger.info(`Payment processed: ${transactionId} for verification ${verificationId}`);

      return {
        success: true,
        transactionId
      };
    } catch (error: any) {
      logger.error(`Payment processing failed: ${error.message}`);
      
      // Update payment status to failed
      await ReferralVerification.findByIdAndUpdate(verificationId, {
        'payment.status': 'failed'
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send payment notifications
  private async sendPaymentNotifications(verification: any): Promise<void> {
    try {
      const seeker = await User.findById(verification.seekerId);
      const referrer = await User.findById(verification.referrerId);

      if (!seeker || !referrer) return;

      // Notify referrer about payment
      await notificationService.create({
        recipientUserId: referrer._id.toString(),
        recipientRole: 'referrer',
        title: '💰 Payment Processed!',
        message: `You've received $${verification.payment.referrerAmount} for your successful referral!`,
        type: 'status_update',
        entityId: verification._id.toString()
      });

      // Notify seeker about completion
      await notificationService.create({
        recipientUserId: seeker._id.toString(),
        recipientRole: 'seeker',
        title: '🎉 Referral Completed!',
        message: 'Your referral has been verified and payment has been processed to your referrer.',
        type: 'status_update',
        entityId: verification._id.toString()
      });

      logger.info(`Payment notifications sent for verification ${verification._id}`);
    } catch (error: any) {
      logger.error(`Failed to send payment notifications: ${error.message}`);
    }
  }

  // Refund payment
  async refundPayment(verificationId: string, reason: string): Promise<boolean> {
    try {
      const verification = await ReferralVerification.findById(verificationId);

      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.payment.status !== 'completed') {
        throw new Error('Payment not completed, cannot refund');
      }

      // Process refund (integrate with payment gateway)
      verification.payment.status = 'refunded';
      verification.timeline.push({
        stage: 'payment',
        status: 'refunded',
        date: new Date(),
        notes: `Payment refunded: ${reason}`,
        verifiedBy: 'admin'
      });

      await verification.save();

      // Update referral
      await Referral.findByIdAndUpdate(verification.referralId, {
        paymentStatus: 'refunded'
      });

      logger.info(`Payment refunded for verification ${verificationId}: ${reason}`);
      return true;
    } catch (error: any) {
      logger.error(`Refund failed: ${error.message}`);
      return false;
    }
  }

  // Get payment statistics
  async getPaymentStats(): Promise<{
    totalProcessed: number;
    totalPlatformFees: number;
    totalReferrerPayments: number;
    pendingPayments: number;
    completedPayments: number;
  }> {
    try {
      const stats = await ReferralVerification.aggregate([
        {
          $group: {
            _id: '$payment.status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$payment.totalAmount' },
            platformFees: { $sum: '$payment.platformFee' },
            referrerPayments: { $sum: '$payment.referrerAmount' }
          }
        }
      ]);

      const result = {
        totalProcessed: 0,
        totalPlatformFees: 0,
        totalReferrerPayments: 0,
        pendingPayments: 0,
        completedPayments: 0
      };

      stats.forEach(stat => {
        if (stat._id === 'completed') {
          result.totalProcessed = stat.totalAmount;
          result.totalPlatformFees = stat.platformFees;
          result.totalReferrerPayments = stat.referrerPayments;
          result.completedPayments = stat.count;
        } else if (stat._id === 'pending') {
          result.pendingPayments = stat.count;
        }
      });

      return result;
    } catch (error: any) {
      logger.error(`Failed to get payment stats: ${error.message}`);
      return {
        totalProcessed: 0,
        totalPlatformFees: 0,
        totalReferrerPayments: 0,
        pendingPayments: 0,
        completedPayments: 0
      };
    }
  }
}

export default new PaymentProcessingService();
