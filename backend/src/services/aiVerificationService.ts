import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export class AIVerificationService {
  
  // Analyze evidence documents using AI
  async analyzeEvidence(evidence: {
    type: string;
    url: string;
    uploadedBy: string;
  }[]): Promise<{
    confidenceScore: number;
    fraudRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
    evidenceQuality: 'poor' | 'fair' | 'good' | 'excellent';
    details: string;
  }> {
    try {
      const evidenceSummary = evidence.map(e => 
        `${e.type} uploaded by ${e.uploadedBy}`
      ).join(', ');

      const prompt = `Analyze this referral verification evidence and assess authenticity:

Evidence submitted: ${evidenceSummary}
Total documents: ${evidence.length}

Evaluate:
1. Confidence score (0-100) - How confident are you this is legitimate?
2. Fraud risk (low/medium/high) - Risk of fraudulent claim
3. Evidence quality (poor/fair/good/excellent) - Quality of submitted proof
4. Recommendations - What additional evidence is needed?

Consider:
- Number and type of documents
- Who uploaded them (seeker vs referrer)
- Typical verification patterns
- Red flags for fraud

Respond in JSON format with: confidenceScore, fraudRisk, evidenceQuality, recommendations (array), details`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        confidenceScore: Math.min(Math.max(analysis.confidenceScore || 50, 0), 100),
        fraudRisk: analysis.fraudRisk || 'medium',
        recommendations: analysis.recommendations || [],
        evidenceQuality: analysis.evidenceQuality || 'fair',
        details: analysis.details || 'Analysis completed'
      };
    } catch (error: any) {
      logger.error(`AI evidence analysis failed: ${error.message}`);
      return {
        confidenceScore: 50,
        fraudRisk: 'medium',
        recommendations: ['Manual review required due to analysis error'],
        evidenceQuality: 'fair',
        details: 'Automated analysis unavailable'
      };
    }
  }

  // Verify referral completion with AI
  async verifyReferralCompletion(data: {
    referralDate: Date;
    evidenceTypes: string[];
    seekerConfirmed: boolean;
    referrerConfirmed: boolean;
    companyName: string;
    role: string;
  }): Promise<{
    isVerified: boolean;
    confidence: number;
    reasoning: string;
    requiresManualReview: boolean;
  }> {
    try {
      const daysSinceReferral = Math.floor(
        (Date.now() - data.referralDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const prompt = `Verify if this job referral has been successfully completed:

Referral Details:
- Company: ${data.companyName}
- Role: ${data.role}
- Days since referral: ${daysSinceReferral}
- Evidence submitted: ${data.evidenceTypes.join(', ')}
- Seeker confirmed: ${data.seekerConfirmed}
- Referrer confirmed: ${data.referrerConfirmed}

Determine:
1. Is this referral verified as complete? (true/false)
2. Confidence level (0-100)
3. Reasoning for decision
4. Does it require manual review? (true/false)

Consider:
- Both parties should confirm
- Adequate evidence (offer letter, joining letter, etc.)
- Reasonable timeline
- Red flags for fraud

Respond in JSON format with: isVerified, confidence, reasoning, requiresManualReview`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        isVerified: result.isVerified || false,
        confidence: Math.min(Math.max(result.confidence || 50, 0), 100),
        reasoning: result.reasoning || 'Automated verification',
        requiresManualReview: result.requiresManualReview || false
      };
    } catch (error: any) {
      logger.error(`AI referral verification failed: ${error.message}`);
      return {
        isVerified: false,
        confidence: 0,
        reasoning: 'Verification failed - manual review required',
        requiresManualReview: true
      };
    }
  }

  // Detect fraud patterns
  async detectFraud(data: {
    seekerId: string;
    referrerId: string;
    previousReferrals: number;
    evidenceQuality: string;
    timelineConsistency: boolean;
  }): Promise<{
    fraudScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    flags: string[];
    recommendation: string;
  }> {
    try {
      const prompt = `Analyze this referral for potential fraud:

User Data:
- Seeker ID: ${data.seekerId}
- Referrer ID: ${data.referrerId}
- Previous referrals: ${data.previousReferrals}
- Evidence quality: ${data.evidenceQuality}
- Timeline consistent: ${data.timelineConsistency}

Detect:
1. Fraud score (0-100, higher = more suspicious)
2. Risk level (low/medium/high)
3. Red flags identified
4. Recommendation for action

Consider:
- Unusual patterns (too many referrals, same users)
- Poor evidence quality
- Timeline inconsistencies
- Known fraud indicators

Respond in JSON format with: fraudScore, riskLevel, flags (array), recommendation`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        fraudScore: Math.min(Math.max(analysis.fraudScore || 0, 0), 100),
        riskLevel: analysis.riskLevel || 'low',
        flags: analysis.flags || [],
        recommendation: analysis.recommendation || 'Proceed with verification'
      };
    } catch (error: any) {
      logger.error(`Fraud detection failed: ${error.message}`);
      return {
        fraudScore: 50,
        riskLevel: 'medium',
        flags: ['Analysis error - manual review recommended'],
        recommendation: 'Manual review required'
      };
    }
  }

  // Generate verification notification message
  async generateNotification(data: {
    type: 'evidence_submitted' | 'verification_complete' | 'payment_processed' | 'action_required';
    recipientRole: 'seeker' | 'referrer';
    verificationStage: string;
    details: any;
  }): Promise<{
    subject: string;
    message: string;
  }> {
    try {
      const prompt = `Generate a professional notification message:

Type: ${data.type}
Recipient: ${data.recipientRole}
Stage: ${data.verificationStage}
Details: ${JSON.stringify(data.details)}

Create:
1. Email subject line
2. Clear, professional message body

The message should:
- Be clear and actionable
- Explain current status
- Specify next steps if needed
- Be encouraging and professional

Respond in JSON format with: subject, message`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const notification = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        subject: notification.subject || 'Referral Verification Update',
        message: notification.message || 'Your referral verification has been updated.'
      };
    } catch (error: any) {
      logger.error(`Notification generation failed: ${error.message}`);
      return {
        subject: 'Referral Verification Update',
        message: 'Your referral verification status has been updated. Please check your dashboard for details.'
      };
    }
  }
}

export default new AIVerificationService();
