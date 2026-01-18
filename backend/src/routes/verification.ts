import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  createVerification,
  submitEvidence,
  updateStage,
  verifyAndPay,
  getVerification,
  getUserVerifications,
  raiseDispute,
  manualReview,
  getVerificationStats
} from '../controllers/verificationController';

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// Verification management
router.post('/create', createVerification);
router.post('/:verificationId/evidence', submitEvidence);
router.put('/:verificationId/stage', updateStage);
router.post('/:verificationId/verify-and-pay', verifyAndPay);
router.get('/:verificationId', getVerification);
router.get('/user/all', getUserVerifications);
router.post('/:verificationId/dispute', raiseDispute);

// Admin routes
router.post('/:verificationId/manual-review', adminMiddleware, manualReview);
router.get('/admin/stats', adminMiddleware, getVerificationStats);

export default router;
