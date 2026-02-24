import express from 'express';
import { authenticate } from '../middleware/auth';
import * as withdrawalController from '../controllers/withdrawalController';

const router = express.Router();

// User routes
router.post('/request', authenticate, withdrawalController.requestWithdrawal);
router.get('/my-withdrawals', authenticate, withdrawalController.getUserWithdrawals);

// Admin routes
router.get('/admin/pending', authenticate, withdrawalController.getPendingWithdrawals);
router.post('/:withdrawalId/approve', authenticate, withdrawalController.approveWithdrawal);
router.post('/:withdrawalId/complete', authenticate, withdrawalController.completeWithdrawal);
router.post('/:withdrawalId/reject', authenticate, withdrawalController.rejectWithdrawal);

export default router;
