import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  addCallRecord,
  sendEmail,
  sendBulkEmails,
  getAISuggestions,
  getDashboardStats,
  trackEmailOpen,
  deleteLead
} from '../controllers/salesController';

const router = express.Router();

// Public routes
router.get('/track/open/:trackingId', trackEmailOpen);

// Protected routes
router.use(authMiddleware);

// Lead management
router.post('/leads', createLead);
router.get('/leads', getLeads);
router.get('/leads/:id', getLead);
router.put('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);

// Call management
router.post('/leads/:id/calls', addCallRecord);

// Email automation
router.post('/leads/:id/email', sendEmail);
router.post('/emails/bulk', sendBulkEmails);

// AI features
router.get('/leads/:id/suggestions', getAISuggestions);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

export default router;
