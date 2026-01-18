import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  generateScript,
  analyzeCall,
  generateFollowUp,
  suggestCallTime,
  getCoaching,
  initiateCall,
  initiateBulkCalls,
  voiceWebhook,
  twimlResponse,
  gatherResponse,
  callStatus,
  recordingStatus,
  getCallDetails,
  makeLiveCall,
  endCall
} from '../controllers/aiCallingController';

const router = express.Router();

// Public webhook (no auth required for telephony providers)
router.post('/voice-webhook', voiceWebhook);
router.post('/twiml-response', twimlResponse);
router.post('/gather-response', gatherResponse);
router.post('/call-status', callStatus);
router.post('/recording-status', recordingStatus);

// Protected routes
router.use(authMiddleware);

// Call script generation
router.post('/generate-script', generateScript);

// Call analysis
router.post('/analyze-call', analyzeCall);

// Follow-up generation
router.post('/generate-followup', generateFollowUp);

// Call time suggestions
router.get('/suggest-time/:leadId', suggestCallTime);

// Real-time coaching
router.post('/coaching', getCoaching);

// Initiate automated call
router.post('/initiate-call', initiateCall);

// Bulk calling
router.post('/bulk-calls', initiateBulkCalls);

// Get call details
router.get('/call-details/:callSid', getCallDetails);

// Live AI calling
router.post('/make-live-call', makeLiveCall);
router.post('/end-call/:callSid', endCall);

export default router;
