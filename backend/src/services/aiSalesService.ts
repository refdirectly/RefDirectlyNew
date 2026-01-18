import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

export class AISalesService {
  
  // Analyze call transcript and extract insights
  async analyzeCallTranscript(transcript: string): Promise<{
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    keyPoints: string[];
    nextSteps: string[];
    budget?: number;
    timeline?: string;
  }> {
    const prompt = `Analyze this sales call transcript and provide:
1. A brief summary (2-3 sentences)
2. Overall sentiment (positive/neutral/negative)
3. Key points discussed
4. Recommended next steps
5. Any mentioned budget or timeline

Transcript: ${transcript}

Respond in JSON format.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  // Score lead quality using AI
  async scoreLeadQuality(leadData: {
    companySize: string;
    industry: string;
    budget?: number;
    callHistory: any[];
    emailHistory: any[];
    source: string;
  }): Promise<number> {
    const prompt = `Score this sales lead from 0-100 based on:
- Company size: ${leadData.companySize}
- Industry: ${leadData.industry}
- Budget: ${leadData.budget || 'Not disclosed'}
- Number of interactions: ${leadData.callHistory.length + leadData.emailHistory.length}
- Source: ${leadData.source}
- Recent engagement: ${leadData.callHistory.length > 0 ? 'Active' : 'Inactive'}

Provide only a number between 0-100.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 10
    });

    const score = parseInt(response.choices[0].message.content?.trim() || '50');
    return Math.min(Math.max(score, 0), 100);
  }

  // Generate personalized email
  async generateEmail(params: {
    type: 'initial' | 'follow_up' | 'proposal' | 'reminder' | 'thank_you';
    companyName: string;
    contactPerson: string;
    industry: string;
    previousInteractions?: string;
    specificDetails?: string;
  }): Promise<{ subject: string; body: string }> {
    const emailTemplates = {
      initial: `Create a professional initial outreach email for ${params.contactPerson} at ${params.companyName} (${params.industry} industry). Focus on how our advertising solutions can help their business grow.`,
      follow_up: `Create a follow-up email for ${params.contactPerson} at ${params.companyName}. Previous context: ${params.previousInteractions}. Be friendly and value-focused.`,
      proposal: `Create a proposal email for ${params.contactPerson} at ${params.companyName} with details: ${params.specificDetails}. Include clear next steps.`,
      reminder: `Create a gentle reminder email for ${params.contactPerson} at ${params.companyName}. Reference previous conversation and suggest a meeting.`,
      thank_you: `Create a thank you email for ${params.contactPerson} at ${params.companyName} after our recent interaction. ${params.specificDetails}`
    };

    const prompt = `${emailTemplates[params.type]}

Requirements:
- Professional but conversational tone
- Clear subject line
- Personalized content
- Strong call-to-action
- Keep it concise (under 200 words)

Respond in JSON format with "subject" and "body" fields.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{"subject":"","body":""}');
  }

  // Suggest next best action
  async suggestNextAction(leadData: {
    status: string;
    lastContactDate?: Date;
    callHistory: any[];
    emailHistory: any[];
    aiScore: number;
  }): Promise<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reasoning: string;
    suggestedDate: Date;
  }> {
    const daysSinceContact = leadData.lastContactDate 
      ? Math.floor((Date.now() - leadData.lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const prompt = `Suggest the next best action for this sales lead:
- Status: ${leadData.status}
- Days since last contact: ${daysSinceContact}
- Total calls: ${leadData.callHistory.length}
- Total emails: ${leadData.emailHistory.length}
- AI Score: ${leadData.aiScore}/100

Provide action, priority, reasoning, and days until suggested follow-up in JSON format.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const suggestedDate = new Date();
    suggestedDate.setDate(suggestedDate.getDate() + (result.daysUntilFollowUp || 3));

    return {
      action: result.action,
      priority: result.priority,
      reasoning: result.reasoning,
      suggestedDate
    };
  }
}

export default new AISalesService();
