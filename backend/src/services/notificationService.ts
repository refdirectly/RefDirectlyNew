import nodemailer from 'nodemailer';
import { io } from '../server';
import { logger } from '../utils/logger';
import Notification from '../models/Notification';

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: any;
}

class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send notification (save to DB + socket + email)
  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // Save notification to database
      const savedNotification = await Notification.create({
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority || 'medium',
        link: notification.link,
        metadata: notification.data,
        read: false
      });

      // Send real-time notification via Socket.IO
      io.to(notification.userId).emit('notification', {
        _id: savedNotification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        link: notification.link,
        createdAt: savedNotification.createdAt,
        data: notification.data
      });

      logger.info(`Notification sent and saved for user ${notification.userId}: ${notification.type}`);
    } catch (error: any) {
      logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  // Send email notification
  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'ReferAI'}" <${process.env.SMTP_USER}>`,
        to: params.to,
        subject: params.subject,
        html: params.html
      });

      logger.info(`Email sent to ${params.to}: ${params.subject}`);
      return true;
    } catch (error: any) {
      logger.error(`Email send failed: ${error.message}`);
      return false;
    }
  }

  // Verification stage notifications
  async notifyVerificationStage(params: {
    userId: string;
    userEmail: string;
    userName: string;
    stage: string;
    status: string;
    details?: string;
  }): Promise<void> {
    const stageMessages: any = {
      referral_sent: {
        title: 'Referral Submitted! 📤',
        message: 'Your referral has been submitted. We\'ll notify you when there\'s an update.'
      },
      interview_scheduled: {
        title: 'Interview Scheduled! 📅',
        message: 'Great news! An interview has been scheduled. Please upload proof to continue verification.'
      },
      offer_received: {
        title: 'Offer Received! 🎉',
        message: 'Congratulations! An offer has been received. Please upload the offer letter for verification.'
      },
      joined: {
        title: 'Candidate Joined! 🚀',
        message: 'The candidate has joined the company. Please upload joining documents for final verification.'
      },
      completed: {
        title: 'Verification Complete! ✅',
        message: 'Your referral has been verified! Payment will be processed shortly.'
      }
    };

    const notification = stageMessages[params.stage] || {
      title: 'Verification Update',
      message: 'Your referral verification has been updated.'
    };

    // Send socket notification
    await this.sendNotification({
      userId: params.userId,
      type: 'verification_stage',
      title: notification.title,
      message: notification.message,
      data: { stage: params.stage, status: params.status }
    });

    // Send email
    const emailHtml = this.getVerificationEmailTemplate({
      userName: params.userName,
      stage: params.stage,
      title: notification.title,
      message: notification.message,
      details: params.details
    });

    await this.sendEmail({
      to: params.userEmail,
      subject: notification.title,
      html: emailHtml
    });
  }

  // Payment notification
  async notifyPayment(params: {
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    transactionId: string;
  }): Promise<void> {
    await this.sendNotification({
      userId: params.userId,
      type: 'payment_received',
      title: 'Payment Processed! 💰',
      message: `You've received $${params.amount}!`,
      data: { amount: params.amount, transactionId: params.transactionId }
    });

    const emailHtml = this.getPaymentEmailTemplate({
      userName: params.userName,
      amount: params.amount,
      transactionId: params.transactionId
    });

    await this.sendEmail({
      to: params.userEmail,
      subject: `Payment Received - $${params.amount}`,
      html: emailHtml
    });
  }

  // Action required notification
  async notifyActionRequired(params: {
    userId: string;
    userEmail: string;
    userName: string;
    action: string;
    reason: string;
  }): Promise<void> {
    await this.sendNotification({
      userId: params.userId,
      type: 'action_required',
      title: 'Action Required ⚠️',
      message: params.action,
      data: { reason: params.reason }
    });

    const emailHtml = this.getActionRequiredEmailTemplate({
      userName: params.userName,
      action: params.action,
      reason: params.reason
    });

    await this.sendEmail({
      to: params.userEmail,
      subject: 'Action Required - Referral Verification',
      html: emailHtml
    });
  }

  // Email templates
  private getVerificationEmailTemplate(params: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .stage-badge { display: inline-block; padding: 8px 16px; background: #e3f2fd; color: #1976d2; border-radius: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${params.title}</h1>
    </div>
    <div class="content">
      <p>Hi ${params.userName},</p>
      <p>${params.message}</p>
      <p><span class="stage-badge">Stage: ${params.stage.replace('_', ' ').toUpperCase()}</span></p>
      ${params.details ? `<p><strong>Details:</strong> ${params.details}</p>` : ''}
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'ReferAI'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getPaymentEmailTemplate(params: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .amount { font-size: 48px; font-weight: bold; color: #11998e; text-align: center; margin: 20px 0; }
    .transaction { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payment Received!</h1>
    </div>
    <div class="content">
      <p>Hi ${params.userName},</p>
      <p>Great news! Your payment has been successfully processed.</p>
      <div class="amount">$${params.amount}</div>
      <div class="transaction">
        <strong>Transaction ID:</strong> ${params.transactionId}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}
      </div>
      <p>Thank you for being part of our referral network!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'ReferAI'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getActionRequiredEmailTemplate(params: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Action Required</h1>
    </div>
    <div class="content">
      <p>Hi ${params.userName},</p>
      <div class="alert">
        <strong>Action Needed:</strong> ${params.action}
      </div>
      <p><strong>Reason:</strong> ${params.reason}</p>
      <p>Please take action as soon as possible to continue with your referral verification.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Take Action Now</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'ReferAI'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }
}

export default new NotificationService();
export const createNotification = (notification: NotificationData) => {
  return new NotificationService().sendNotification(notification);
};
