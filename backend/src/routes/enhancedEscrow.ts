import express from 'express';
import { authenticate } from '../middleware/auth';
import * as escrowController from '../controllers/enhancedEscrowController';

const router = express.Router();

// User routes
router.get('/my-escrows', authenticate, escrowController.getUserEscrows);
router.get('/:referralId', authenticate, escrowController.getEscrowDetails);
router.post('/:referralId/dispute', authenticate, escrowController.fileDispute);

// Admin routes
router.get('/admin/pending', authenticate, escrowController.getPendingApprovals);
router.get('/admin/flagged', authenticate, escrowController.getFlaggedTransactions);
router.get('/admin/disputes', authenticate, escrowController.getDisputes);
router.get('/admin/stats', authenticate, escrowController.getEscrowStats);
router.post('/:referralId/approve', authenticate, escrowController.approveEscrow);
router.post('/:referralId/resolve-dispute', authenticate, escrowController.resolveDispute);

export default router;
