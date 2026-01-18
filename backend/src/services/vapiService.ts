import { logger } from '../utils/logger';

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

export class VapiService {
  
  // Make conversational AI call
  async makeConversationalCall(params: {
    phoneNumber: string;
    assistantId?: string;
    name?: string;
    firstMessage?: string;
  }): Promise<{ success: boolean; callId?: string; error?: string }> {
    if (!VAPI_API_KEY) {
      return { success: false, error: 'Vapi API key not configured' };
    }

    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: {
            number: params.phoneNumber,
            name: params.name || 'Customer'
          },
          assistantId: params.assistantId || process.env.VAPI_ASSISTANT_ID
        })
      });

      const data: any = await response.json();

      if (response.ok) {
        logger.info(`Vapi conversational call initiated: ${data.id}`);
        return { success: true, callId: data.id };
      } else {
        logger.error(`Vapi call failed: ${data.message}`);
        return { success: false, error: data.message };
      }
    } catch (error: any) {
      logger.error(`Vapi call error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Get call details
  async getCallDetails(callId: string): Promise<any> {
    if (!VAPI_API_KEY) return null;

    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
      });

      if (response.ok) {
        const data: any = await response.json();
        return data;
      }
      return null;
    } catch (error: any) {
      logger.error(`Failed to get Vapi call details: ${error.message}`);
      return null;
    }
  }

  // List all calls
  async listCalls(): Promise<any[]> {
    if (!VAPI_API_KEY) return [];

    try {
      const response = await fetch(`${VAPI_BASE_URL}/call`, {
        headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
      });

      if (response.ok) {
        const data: any = await response.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (error: any) {
      logger.error(`Failed to list Vapi calls: ${error.message}`);
      return [];
    }
  }
}

export default new VapiService();
