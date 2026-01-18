import twilio from 'twilio';
import { logger } from '../utils/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Only initialize Twilio client if valid credentials are provided
const isValidTwilioConfig = accountSid && authToken && 
  accountSid.startsWith('AC') && 
  accountSid !== 'your-twilio-account-sid';

const client = isValidTwilioConfig ? twilio(accountSid, authToken) : null;

if (!client) {
  logger.warn('Twilio client not initialized - invalid or missing credentials');
}

export class TwilioCallingService {
  
  // Make a single call
  async makeCall(params: {
    to: string;
    leadName: string;
    companyName: string;
    callScript: string;
  }): Promise<{
    success: boolean;
    callSid?: string;
    error?: string;
  }> {
    if (!client || !twilioPhone) {
      logger.warn('Twilio not configured');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${this.escapeXml(params.callScript)}</Say>
  <Gather input="dtmf" timeout="5" numDigits="1" action="${process.env.BACKEND_URL}/api/ai-calling/gather-response" method="POST">
    <Say voice="alice">Press 1 if you are interested in learning more. Press 2 if you would like us to call back later. Press 3 to speak with a representative. Press 9 to be removed from our list.</Say>
  </Gather>
  <Say voice="alice">We did not receive your response. Thank you for your time. Goodbye.</Say>
</Response>`;

      const call = await client.calls.create({
        to: params.to,
        from: twilioPhone,
        twiml: twiml,
        statusCallback: `${process.env.BACKEND_URL}/api/ai-calling/call-status`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['completed'],
        record: true
      });

      logger.info(`Call initiated: ${call.sid} to ${params.to}`);
      
      return {
        success: true,
        callSid: call.sid
      };
    } catch (error: any) {
      logger.error(`Call failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Make bulk calls
  async makeBulkCalls(params: {
    leads: Array<{
      id: string;
      phone: string;
      name: string;
      company: string;
    }>;
    callScript: string;
    delayBetweenCalls?: number;
  }): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{
      leadId: string;
      success: boolean;
      callSid?: string;
      error?: string;
    }>;
  }> {
    const results: Array<any> = [];
    let successful = 0;
    let failed = 0;
    const delay = params.delayBetweenCalls || 5000; // 5 seconds default

    for (const lead of params.leads) {
      const result = await this.makeCall({
        to: lead.phone,
        leadName: lead.name,
        companyName: lead.company,
        callScript: params.callScript
      });

      results.push({
        leadId: lead.id,
        ...result
      });

      if (result.success) successful++;
      else failed++;

      // Delay between calls to avoid rate limits
      if (params.leads.indexOf(lead) < params.leads.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    logger.info(`Bulk calling completed: ${successful} successful, ${failed} failed`);

    return {
      total: params.leads.length,
      successful,
      failed,
      results
    };
  }

  // Generate TwiML for call
  generateTwiML(script: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${this.escapeXml(script)}</Say>
  <Gather input="speech dtmf" timeout="5" numDigits="1" action="${process.env.BACKEND_URL}/api/ai-calling/gather-response" method="POST">
    <Say voice="alice">Press 1 if you're interested, or 2 to be removed from our list.</Say>
  </Gather>
  <Say voice="alice">Thank you for your time. Goodbye.</Say>
</Response>`;
  }

  // Generate TwiML for voicemail
  generateVoicemailTwiML(script: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${this.escapeXml(script)}</Say>
  <Say voice="alice">Please call us back at your convenience. Thank you.</Say>
</Response>`;
  }

  // Get call details
  async getCallDetails(callSid: string): Promise<any> {
    if (!client) return null;

    try {
      const call = await client.calls(callSid).fetch();
      return {
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        from: call.from,
        to: call.to,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        direction: call.direction
      };
    } catch (error: any) {
      logger.error(`Failed to fetch call details: ${error.message}`);
      return null;
    }
  }

  // Get call recording
  async getCallRecording(callSid: string): Promise<string | null> {
    if (!client) return null;

    try {
      const recordings = await client.recordings.list({ callSid, limit: 1 });
      if (recordings.length > 0) {
        return `https://api.twilio.com${recordings[0].uri.replace('.json', '.mp3')}`;
      }
      return null;
    } catch (error: any) {
      logger.error(`Failed to fetch recording: ${error.message}`);
      return null;
    }
  }

  // Get call transcription
  async getCallTranscription(recordingSid: string): Promise<string | null> {
    if (!client) return null;

    try {
      const transcriptions = await client.recordings(recordingSid).transcriptions.list({ limit: 1 });
      if (transcriptions.length > 0) {
        return transcriptions[0].transcriptionText;
      }
      return null;
    } catch (error: any) {
      logger.error(`Failed to fetch transcription: ${error.message}`);
      return null;
    }
  }

  // Schedule bulk calls
  async scheduleBulkCalls(params: {
    leads: Array<any>;
    callScript: string;
    scheduleTime: Date;
  }): Promise<{
    scheduled: boolean;
    scheduleId: string;
  }> {
    // In production, use a job queue like Bull or AWS SQS
    const scheduleId = `schedule_${Date.now()}`;
    
    logger.info(`Bulk calls scheduled for ${params.scheduleTime}: ${params.leads.length} leads`);
    
    // Store in database for processing
    // await ScheduledCall.create({ scheduleId, leads: params.leads, script: params.callScript, scheduleTime: params.scheduleTime });
    
    return {
      scheduled: true,
      scheduleId
    };
  }

  // Helper to escape XML
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export default new TwilioCallingService();
