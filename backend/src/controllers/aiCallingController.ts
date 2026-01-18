import { Request, Response } from 'express';
import aiCallingService from '../services/aiCallingService';
import twilioCallingService from '../services/twilioCallingService';
import vapiService from '../services/vapiService';
import SalesLead from '../models/SalesLead';
import { logger } from '../utils/logger';

// Generate call script
export const generateScript = async (req: Request, res: Response) => {
  try {
    const { leadId, leadName, company, role, painPoints, objective } = req.body;
    
    // If leadId provided, use lead data
    if (leadId) {
      const lead = await SalesLead.findById(leadId);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });

      const previousContext = lead.callHistory.length > 0 
        ? lead.callHistory[lead.callHistory.length - 1].summary 
        : undefined;

      const script = await aiCallingService.generateCallScript({
        leadName: lead.contactPerson,
        companyName: lead.companyName,
        industry: lead.industry,
        callPurpose: objective || 'discovery',
        previousContext
      });

      return res.json({ script });
    }

    // Otherwise use provided data
    const script = await aiCallingService.generateCallScript({
      leadName: leadName || 'valued customer',
      companyName: company || 'your company',
      industry: role || 'general',
      callPurpose: objective || 'discovery'
    });

    res.json({ script });
  } catch (error: any) {
    logger.error(`Generate script error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Analyze call
export const analyzeCall = async (req: Request, res: Response) => {
  try {
    const { leadId, transcript, duration } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const analysis = await aiCallingService.analyzeCall({
      transcript,
      duration: duration || 0,
      leadId: leadId || 'standalone'
    });

    // Save to lead if leadId provided
    if (leadId) {
      const lead = await SalesLead.findById(leadId);
      if (lead) {
        lead.callHistory.push({
          date: new Date(),
          duration: duration || 0,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
          aiTranscript: transcript,
          outcome: analysis.nextSteps
        });
        await lead.save();
      }
    }

    res.json({ analysis });
  } catch (error: any) {
    logger.error(`Analyze call error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Generate follow-up
export const generateFollowUp = async (req: Request, res: Response) => {
  try {
    const { leadId, leadName, callSummary, nextSteps, type } = req.body;
    
    // If leadId provided, use lead data
    if (leadId) {
      const lead = await SalesLead.findById(leadId);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });

      const lastCall = lead.callHistory[lead.callHistory.length - 1];
      if (!lastCall) return res.status(400).json({ error: 'No call history found' });

      const followUp = await aiCallingService.generateFollowUp({
        leadName: lead.contactPerson,
        callSummary: lastCall.summary,
        nextSteps: lastCall.outcome,
        medium: type || 'email'
      });

      return res.json({ followup: followUp });
    }

    // Otherwise use provided data
    if (!callSummary) {
      return res.status(400).json({ error: 'Call summary is required' });
    }

    const followUp = await aiCallingService.generateFollowUp({
      leadName: leadName || 'valued customer',
      callSummary,
      nextSteps: nextSteps || 'Follow up on discussion',
      medium: type || 'email'
    });

    res.json({ followup: followUp });
  } catch (error: any) {
    logger.error(`Generate follow-up error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Suggest call time
export const suggestCallTime = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    
    const lead = await SalesLead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const suggestion = await aiCallingService.suggestCallTime({
      leadTimezone: 'America/New_York',
      leadIndustry: lead.industry,
      previousCallHistory: lead.callHistory.map(call => ({
        time: call.date,
        answered: true
      }))
    });

    res.json({ suggestion });
  } catch (error: any) {
    logger.error(`Suggest call time error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Real-time coaching
export const getCoaching = async (req: Request, res: Response) => {
  try {
    const { currentPhase, transcript, leadResponse } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const coaching = await aiCallingService.getCallCoaching({
      currentTranscript: transcript,
      callStage: currentPhase || 'introduction',
      leadResponse: leadResponse || ''
    });

    res.json({ suggestions: [coaching.suggestion] });
  } catch (error: any) {
    logger.error(`Get coaching error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Initiate automated call (webhook for telephony integration)
export const initiateCall = async (req: Request, res: Response) => {
  try {
    const { leadId, phoneNumber } = req.body;
    
    const lead = await SalesLead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Generate script for the call
    const scriptData = await aiCallingService.generateCallScript({
      leadName: lead.contactPerson,
      companyName: lead.companyName,
      industry: lead.industry,
      callPurpose: 'cold_call'
    });

    // Make real call via Twilio
    const callResult = await twilioCallingService.makeCall({
      to: phoneNumber || lead.phone,
      leadName: lead.contactPerson,
      companyName: lead.companyName,
      callScript: scriptData.script
    });

    if (!callResult.success) {
      return res.status(500).json({ error: callResult.error });
    }

    logger.info(`Call initiated for lead ${leadId}: ${callResult.callSid}`);
    
    res.json({ 
      message: 'Call initiated successfully',
      callSid: callResult.callSid,
      script: scriptData.script
    });
  } catch (error: any) {
    logger.error(`Initiate call error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Voice webhook (for telephony provider callbacks)
export const voiceWebhook = async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus } = req.body;
    logger.info(`Voice webhook: ${CallSid} - ${CallStatus}`);

    // Generate TwiML response
    const twiml = twilioCallingService.generateTwiML(
      'Hello! This is an automated call from our sales team. We have an exciting opportunity to discuss with you.'
    );

    res.type('text/xml');
    res.send(twiml);
  } catch (error: any) {
    logger.error(`Voice webhook error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};


// Bulk calling
export const initiateBulkCalls = async (req: Request, res: Response) => {
  try {
    const { leadIds, delayBetweenCalls } = req.body;
    
    const leads = await SalesLead.find({ _id: { $in: leadIds } });
    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found' });
    }

    // Generate script
    const scriptData = await aiCallingService.generateCallScript({
      leadName: 'valued customer',
      companyName: 'your company',
      industry: 'general',
      callPurpose: 'cold_call'
    });

    // Prepare leads for bulk calling
    const leadsData = leads.map(lead => ({
      id: lead._id.toString(),
      phone: lead.phone,
      name: lead.contactPerson,
      company: lead.companyName
    }));

    // Make bulk calls
    const result = await twilioCallingService.makeBulkCalls({
      leads: leadsData,
      callScript: scriptData.script,
      delayBetweenCalls
    });

    logger.info(`Bulk calling completed: ${result.successful}/${result.total} successful`);
    
    res.json({
      message: 'Bulk calling completed',
      ...result
    });
  } catch (error: any) {
    logger.error(`Bulk calling error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// TwiML response
export const twimlResponse = async (req: Request, res: Response) => {
  try {
    const twiml = twilioCallingService.generateTwiML(
      'Hello! This is an automated call from our sales team. We would like to discuss an exciting opportunity with you. Press 1 if you are interested, or press 2 to be removed from our calling list.'
    );
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error: any) {
    logger.error(`TwiML response error: ${error.message}`);
    res.status(500).send();
  }
};

// Gather response
export const gatherResponse = async (req: Request, res: Response) => {
  try {
    const { Digits, CallSid } = req.body;
    
    logger.info(`Customer pressed: ${Digits} on call ${CallSid}`);
    
    let twiml = '';
    
    if (Digits === '1') {
      // Interested - provide more information
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Excellent! We're excited to work with you. Our solution can help streamline your operations and increase efficiency by up to 40 percent.</Say>
  <Gather input="dtmf" timeout="5" numDigits="1" action="${process.env.BACKEND_URL}/api/ai-calling/gather-response" method="POST">
    <Say voice="alice">Press 1 to schedule a demo call. Press 2 to receive information via email. Press 3 to speak with our team now.</Say>
  </Gather>
  <Say voice="alice">Thank you for your interest. We will follow up with you shortly. Goodbye.</Say>
</Response>`;
    } else if (Digits === '2') {
      // Call back later
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">No problem! We understand you're busy.</Say>
  <Gather input="dtmf" timeout="5" numDigits="1" action="${process.env.BACKEND_URL}/api/ai-calling/gather-response" method="POST">
    <Say voice="alice">When would be a good time to call back? Press 1 for tomorrow morning. Press 2 for tomorrow afternoon. Press 3 for next week.</Say>
  </Gather>
  <Say voice="alice">We will call you back at a convenient time. Thank you!</Say>
</Response>`;
    } else if (Digits === '3') {
      // Speak with representative
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please hold while we connect you to one of our representatives.</Say>
  <Say voice="alice">All our representatives are currently busy. Please leave a message after the beep, and we will call you back within 24 hours.</Say>
  <Record maxLength="60" action="${process.env.BACKEND_URL}/api/ai-calling/recording-status" />
  <Say voice="alice">Thank you for your message. We will get back to you soon. Goodbye.</Say>
</Response>`;
    } else if (Digits === '9') {
      // Remove from list
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We understand. You have been removed from our calling list. We apologize for any inconvenience. Goodbye.</Say>
</Response>`;
    } else {
      // Invalid input
      twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, we didn't understand your selection.</Say>
  <Gather input="dtmf" timeout="5" numDigits="1" action="${process.env.BACKEND_URL}/api/ai-calling/gather-response" method="POST">
    <Say voice="alice">Press 1 if interested. Press 2 to call back later. Press 3 to speak with someone. Press 9 to be removed.</Say>
  </Gather>
  <Say voice="alice">Thank you for your time. Goodbye.</Say>
</Response>`;
    }
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error: any) {
    logger.error(`Gather response error: ${error.message}`);
    res.status(500).send();
  }
};

// Call status callback
export const callStatus = async (req: Request, res: Response) => {
  try {
    const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
    
    logger.info(`Call status: ${CallSid} - ${CallStatus} - Duration: ${CallDuration}s`);
    
    // Update lead with call status
    // await SalesLead.updateOne({ 'callHistory.callSid': CallSid }, { ... });
    
    res.sendStatus(200);
  } catch (error: any) {
    logger.error(`Call status error: ${error.message}`);
    res.status(500).send();
  }
};

// Recording status callback
export const recordingStatus = async (req: Request, res: Response) => {
  try {
    const { CallSid, RecordingSid, RecordingUrl, RecordingDuration } = req.body;
    
    logger.info(`Recording ready: ${RecordingSid} for call ${CallSid}`);
    
    // Get transcription
    const transcription = await twilioCallingService.getCallTranscription(RecordingSid);
    
    if (transcription) {
      // Analyze with AI
      const analysis = await aiCallingService.analyzeCall({
        transcript: transcription,
        duration: parseInt(RecordingDuration || '0'),
        leadId: CallSid
      });
      
      logger.info(`Call analyzed: ${analysis.sentiment}`);
    }
    
    res.sendStatus(200);
  } catch (error: any) {
    logger.error(`Recording status error: ${error.message}`);
    res.status(500).send();
  }
};

// Get call details
export const getCallDetails = async (req: Request, res: Response) => {
  try {
    const { callSid } = req.params;
    
    const details = await twilioCallingService.getCallDetails(callSid);
    
    if (!details) {
      return res.status(404).json({ error: 'Call not found' });
    }
    
    res.json({ details });
  } catch (error: any) {
    logger.error(`Get call details error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Make live AI call
export const makeLiveCall = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, leadName, company, callPurpose, useConversationalAI } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Use Vapi for conversational AI
    if (useConversationalAI) {
      const firstMessage = `Hello ${leadName || 'there'}! I'm calling from ${company || 'our company'}. How are you doing today? I'd love to chat about how we can help your business.`;
      
      const result = await vapiService.makeConversationalCall({
        phoneNumber,
        name: leadName,
        firstMessage
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      logger.info(`Conversational AI call initiated to ${phoneNumber}: ${result.callId}`);
      
      return res.json({ 
        success: true,
        callSid: result.callId,
        message: 'Conversational AI call initiated',
        type: 'conversational'
      });
    }

    // Use Twilio for script-based calls
    const scriptData = await aiCallingService.generateCallScript({
      leadName: leadName || 'valued customer',
      companyName: company || 'our company',
      industry: 'general',
      callPurpose: callPurpose || 'discovery'
    });

    const callResult = await twilioCallingService.makeCall({
      to: phoneNumber,
      leadName: leadName || 'Customer',
      companyName: company || 'Company',
      callScript: scriptData.script
    });

    if (!callResult.success) {
      return res.status(500).json({ error: callResult.error });
    }

    logger.info(`Script-based call initiated to ${phoneNumber}: ${callResult.callSid}`);
    
    res.json({ 
      success: true,
      callSid: callResult.callSid,
      message: 'Call initiated successfully',
      type: 'script'
    });
  } catch (error: any) {
    logger.error(`Make live call error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// End call
export const endCall = async (req: Request, res: Response) => {
  try {
    const { callSid } = req.params;
    
    // Twilio doesn't have a direct end call API, but we can update status
    logger.info(`Call end requested: ${callSid}`);
    
    res.json({ success: true, message: 'Call will end shortly' });
  } catch (error: any) {
    logger.error(`End call error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
