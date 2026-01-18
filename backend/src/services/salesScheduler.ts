import cron from 'node-cron';
import SalesLead from '../models/SalesLead';
import emailAutomationService from '../services/emailAutomationService';
import aiSalesService from '../services/aiSalesService';
import { logger } from '../utils/logger';

class SalesAutomationScheduler {
  
  // Check for follow-ups every hour
  startFollowUpScheduler() {
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running follow-up scheduler...');
        
        const now = new Date();
        const leadsNeedingFollowUp = await SalesLead.find({
          nextFollowUpDate: { $lte: now },
          status: { $nin: ['closed_won', 'closed_lost'] }
        });

        logger.info(`Found ${leadsNeedingFollowUp.length} leads needing follow-up`);

        for (const lead of leadsNeedingFollowUp) {
          // Get AI suggestion for next action
          const suggestion = await aiSalesService.suggestNextAction({
            status: lead.status,
            lastContactDate: lead.lastContactDate,
            callHistory: lead.callHistory,
            emailHistory: lead.emailHistory,
            aiScore: lead.aiScore
          });

          // Send follow-up email
          await emailAutomationService.sendEmail({
            leadId: lead._id.toString(),
            type: 'follow_up'
          });

          // Update next follow-up date
          lead.nextFollowUpDate = suggestion.suggestedDate;
          lead.priority = suggestion.priority;
          await lead.save();

          logger.info(`Follow-up sent to ${lead.email}`);
        }
      } catch (error: any) {
        logger.error(`Follow-up scheduler error: ${error.message}`);
      }
    });

    logger.info('Follow-up scheduler started');
  }

  // Update AI scores daily
  startScoreUpdateScheduler() {
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running AI score update...');
        
        const activeLeads = await SalesLead.find({
          status: { $nin: ['closed_won', 'closed_lost'] }
        });

        for (const lead of activeLeads) {
          lead.aiScore = await aiSalesService.scoreLeadQuality({
            companySize: lead.companySize,
            industry: lead.industry,
            budget: lead.budget,
            callHistory: lead.callHistory,
            emailHistory: lead.emailHistory,
            source: lead.source
          });
          await lead.save();
        }

        logger.info(`Updated AI scores for ${activeLeads.length} leads`);
      } catch (error: any) {
        logger.error(`Score update error: ${error.message}`);
      }
    });

    logger.info('AI score update scheduler started');
  }

  // Send weekly summary to sales team
  startWeeklySummaryScheduler() {
    cron.schedule('0 9 * * 1', async () => {
      try {
        logger.info('Generating weekly sales summary...');
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const newLeads = await SalesLead.countDocuments({ createdAt: { $gte: weekAgo } });
        const closedWon = await SalesLead.countDocuments({ 
          status: 'closed_won',
          updatedAt: { $gte: weekAgo }
        });
        const totalCalls = await SalesLead.aggregate([
          { $unwind: '$callHistory' },
          { $match: { 'callHistory.date': { $gte: weekAgo } } },
          { $count: 'total' }
        ]);
        const totalEmails = await SalesLead.aggregate([
          { $unwind: '$emailHistory' },
          { $match: { 'emailHistory.date': { $gte: weekAgo } } },
          { $count: 'total' }
        ]);

        const summary = {
          newLeads,
          closedWon,
          totalCalls: totalCalls[0]?.total || 0,
          totalEmails: totalEmails[0]?.total || 0,
          week: `${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`
        };

        logger.info('Weekly summary:', summary);
        // TODO: Send email to sales team with summary
      } catch (error: any) {
        logger.error(`Weekly summary error: ${error.message}`);
      }
    });

    logger.info('Weekly summary scheduler started');
  }

  // Identify stale leads and re-engage
  startStaleLeadScheduler() {
    cron.schedule('0 10 * * *', async () => {
      try {
        logger.info('Checking for stale leads...');
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const staleLeads = await SalesLead.find({
          lastContactDate: { $lte: thirtyDaysAgo },
          status: { $nin: ['closed_won', 'closed_lost'] },
          aiScore: { $gte: 50 } // Only re-engage high-quality leads
        });

        logger.info(`Found ${staleLeads.length} stale leads to re-engage`);

        for (const lead of staleLeads) {
          await emailAutomationService.sendEmail({
            leadId: lead._id.toString(),
            type: 'reminder'
          });

          lead.priority = 'medium';
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 7);
          lead.nextFollowUpDate = followUpDate;
          await lead.save();

          logger.info(`Re-engagement email sent to ${lead.email}`);
        }
      } catch (error: any) {
        logger.error(`Stale lead scheduler error: ${error.message}`);
      }
    });

    logger.info('Stale lead scheduler started');
  }

  // Start all schedulers
  startAll() {
    this.startFollowUpScheduler();
    this.startScoreUpdateScheduler();
    this.startWeeklySummaryScheduler();
    this.startStaleLeadScheduler();
    logger.info('All sales automation schedulers started');
  }
}

export default new SalesAutomationScheduler();
