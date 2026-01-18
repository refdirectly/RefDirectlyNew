import { Request, Response } from 'express';
import SalesLead from '../models/SalesLead';
import aiSalesService from '../services/aiSalesService';
import emailAutomationService from '../services/emailAutomationService';
import { logger } from '../utils/logger';

// Create new lead
export const createLead = async (req: Request, res: Response) => {
  try {
    const leadData = req.body;
    
    // Check if lead already exists
    const existingLead = await SalesLead.findOne({ email: leadData.email });
    if (existingLead) {
      return res.status(400).json({ error: 'Lead with this email already exists' });
    }

    const lead = new SalesLead(leadData);
    
    // Calculate initial AI score
    lead.aiScore = await aiSalesService.scoreLeadQuality({
      companySize: lead.companySize,
      industry: lead.industry,
      budget: lead.budget,
      callHistory: [],
      emailHistory: [],
      source: lead.source
    });

    await lead.save();

    // Send initial email if requested
    if (req.body.sendInitialEmail) {
      await emailAutomationService.sendEmail({
        leadId: lead._id.toString(),
        type: 'initial'
      });
    }

    logger.info(`New lead created: ${lead.email}`);
    res.status(201).json({ lead });
  } catch (error: any) {
    logger.error(`Create lead error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get all leads with filters
export const getLeads = async (req: Request, res: Response) => {
  try {
    const { status, priority, minScore, source, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (minScore) filter.aiScore = { $gte: parseInt(minScore as string) };
    if (source) filter.source = source;

    const leads = await SalesLead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ aiScore: -1, updatedAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await SalesLead.countDocuments(filter);

    res.json({ leads, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error: any) {
    logger.error(`Get leads error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get single lead
export const getLead = async (req: Request, res: Response) => {
  try {
    const lead = await SalesLead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    
    res.json({ lead });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update lead
export const updateLead = async (req: Request, res: Response) => {
  try {
    const lead = await SalesLead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Recalculate AI score
    lead.aiScore = await aiSalesService.scoreLeadQuality({
      companySize: lead.companySize,
      industry: lead.industry,
      budget: lead.budget,
      callHistory: lead.callHistory,
      emailHistory: lead.emailHistory,
      source: lead.source
    });

    await lead.save();
    logger.info(`Lead updated: ${lead.email}`);
    res.json({ lead });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add call record with AI analysis
export const addCallRecord = async (req: Request, res: Response) => {
  try {
    const { transcript, duration, outcome } = req.body;
    const lead = await SalesLead.findById(req.params.id);
    
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Analyze call with AI
    const analysis = await aiSalesService.analyzeCallTranscript(transcript);

    lead.callHistory.push({
      date: new Date(),
      duration,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
      aiTranscript: transcript,
      outcome
    });

    lead.lastContactDate = new Date();
    
    // Update budget if mentioned
    if (analysis.budget) lead.budget = analysis.budget;

    // Recalculate AI score
    lead.aiScore = await aiSalesService.scoreLeadQuality({
      companySize: lead.companySize,
      industry: lead.industry,
      budget: lead.budget,
      callHistory: lead.callHistory,
      emailHistory: lead.emailHistory,
      source: lead.source
    });

    await lead.save();

    // Suggest next action
    const nextAction = await aiSalesService.suggestNextAction({
      status: lead.status,
      lastContactDate: lead.lastContactDate,
      callHistory: lead.callHistory,
      emailHistory: lead.emailHistory,
      aiScore: lead.aiScore
    });

    logger.info(`Call recorded for lead: ${lead.email}`);
    res.json({ lead, analysis, nextAction });
  } catch (error: any) {
    logger.error(`Add call record error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Send email
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { type, customContent } = req.body;
    
    const success = await emailAutomationService.sendEmail({
      leadId: req.params.id,
      type,
      customContent
    });

    if (success) {
      res.json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Send bulk emails
export const sendBulkEmails = async (req: Request, res: Response) => {
  try {
    const { leadIds, type, delayBetweenEmails } = req.body;
    
    const result = await emailAutomationService.sendBulkEmails({
      leadIds,
      type,
      delayBetweenEmails
    });

    res.json({ message: 'Bulk email campaign completed', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get AI suggestions
export const getAISuggestions = async (req: Request, res: Response) => {
  try {
    const lead = await SalesLead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const nextAction = await aiSalesService.suggestNextAction({
      status: lead.status,
      lastContactDate: lead.lastContactDate,
      callHistory: lead.callHistory,
      emailHistory: lead.emailHistory,
      aiScore: lead.aiScore
    });

    const emailSuggestion = await aiSalesService.generateEmail({
      type: 'follow_up',
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      industry: lead.industry,
      previousInteractions: lead.callHistory.length > 0 ? lead.callHistory[lead.callHistory.length - 1].summary : ''
    });

    res.json({ nextAction, emailSuggestion });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalLeads = await SalesLead.countDocuments();
    const qualifiedLeads = await SalesLead.countDocuments({ status: { $in: ['qualified', 'proposal_sent', 'negotiation'] } });
    const closedWon = await SalesLead.countDocuments({ status: 'closed_won' });
    const closedLost = await SalesLead.countDocuments({ status: 'closed_lost' });
    
    const highPriorityLeads = await SalesLead.countDocuments({ priority: { $in: ['high', 'urgent'] } });
    const needsFollowUp = await SalesLead.countDocuments({ 
      nextFollowUpDate: { $lte: new Date() },
      status: { $nin: ['closed_won', 'closed_lost'] }
    });

    const avgScore = await SalesLead.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$aiScore' } } }
    ]);

    const recentActivity = await SalesLead.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('companyName contactPerson status updatedAt');

    res.json({
      totalLeads,
      qualifiedLeads,
      closedWon,
      closedLost,
      conversionRate: totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(2) : 0,
      highPriorityLeads,
      needsFollowUp,
      avgScore: avgScore[0]?.avgScore || 0,
      recentActivity
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Track email open
export const trackEmailOpen = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const [leadId] = trackingId.split('_');
    
    const lead = await SalesLead.findById(leadId);
    if (lead && lead.emailHistory.length > 0) {
      lead.emailHistory[lead.emailHistory.length - 1].opened = true;
      await lead.save();
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    res.end(pixel);
  } catch (error: any) {
    res.status(500).end();
  }
};

// Delete lead
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const lead = await SalesLead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    
    logger.info(`Lead deleted: ${lead.email}`);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
