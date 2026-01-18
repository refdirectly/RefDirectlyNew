import nodemailer from 'nodemailer';
import SalesLead from '../models/SalesLead';
import aiSalesService from './aiSalesService';
import { logger } from '../utils/logger';

class EmailAutomationService {
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

  // Send automated email with tracking
  async sendEmail(params: {
    leadId: string;
    type: 'initial' | 'follow_up' | 'proposal' | 'reminder' | 'thank_you';
    customContent?: { subject?: string; body?: string };
  }): Promise<boolean> {
    try {
      const lead = await SalesLead.findById(params.leadId);
      if (!lead) throw new Error('Lead not found');

      let emailContent;
      
      if (params.customContent?.subject && params.customContent?.body) {
        emailContent = params.customContent;
      } else {
        // Generate AI email
        const previousInteractions = lead.callHistory.length > 0 
          ? lead.callHistory[lead.callHistory.length - 1].summary 
          : '';

        emailContent = await aiSalesService.generateEmail({
          type: params.type,
          companyName: lead.companyName,
          contactPerson: lead.contactPerson,
          industry: lead.industry,
          previousInteractions,
          specificDetails: lead.notes
        });
      }

      // Add tracking pixel
      const trackingId = `${lead._id}_${Date.now()}`;
      const trackingPixel = `<img src="${process.env.BACKEND_URL}/api/sales/track/open/${trackingId}" width="1" height="1" />`;
      const bodyWithTracking = emailContent.body.replace('</body>', `${trackingPixel}</body>`);

      // Send email
      await this.transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'Sales Team'}" <${process.env.SMTP_USER}>`,
        to: lead.email,
        subject: emailContent.subject,
        html: this.getEmailTemplate(bodyWithTracking, lead.contactPerson),
        text: emailContent.body.replace(/<[^>]*>/g, '')
      });

      // Update lead
      lead.emailHistory.push({
        date: new Date(),
        subject: emailContent.subject,
        body: emailContent.body,
        type: params.type,
        opened: false,
        clicked: false
      });
      lead.lastContactDate = new Date();
      await lead.save();

      logger.info(`Email sent to ${lead.email} - Type: ${params.type}`);
      return true;
    } catch (error: any) {
      logger.error(`Email send failed: ${error.message}`);
      return false;
    }
  }

  // Send simple email (for admin notifications)
  async sendSimpleEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'Platform'}" <${process.env.SMTP_USER}>`,
        to: params.to,
        subject: params.subject,
        html: params.html
      });
      logger.info(`Simple email sent to ${params.to}`);
      return true;
    } catch (error: any) {
      logger.error(`Simple email send failed: ${error.message}`);
      return false;
    }
  }

  // Send bulk emails
  async sendBulkEmails(params: {
    leadIds: string[];
    type: 'initial' | 'follow_up' | 'proposal' | 'reminder' | 'thank_you';
    delayBetweenEmails?: number;
  }): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    const delay = params.delayBetweenEmails || 2000; // 2 seconds default

    for (const leadId of params.leadIds) {
      const success = await this.sendEmail({ leadId, type: params.type });
      if (success) sent++;
      else failed++;

      // Delay to avoid spam filters
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    logger.info(`Bulk email campaign completed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // Schedule follow-up emails
  async scheduleFollowUp(leadId: string, daysFromNow: number): Promise<void> {
    const lead = await SalesLead.findById(leadId);
    if (!lead) throw new Error('Lead not found');

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + daysFromNow);
    
    lead.nextFollowUpDate = followUpDate;
    await lead.save();

    logger.info(`Follow-up scheduled for ${lead.email} on ${followUpDate.toISOString()}`);
  }

  // Email template
  private getEmailTemplate(content: string, recipientName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${process.env.COMPANY_NAME || 'Sales Team'}</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Company'}. All rights reserved.</p>
      <p><a href="${process.env.FRONTEND_URL}/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
  }
}

export default new EmailAutomationService();
