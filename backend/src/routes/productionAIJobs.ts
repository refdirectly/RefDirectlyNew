import express from 'express';
import { authenticate } from '../middleware/auth';
import { startProductionAutoApply, getAutoApplyStatus } from '../controllers/productionAIJobController';

const router = express.Router();

// Start AI auto-apply workflow
router.post('/auto-apply', authenticate, startProductionAutoApply);

// Get auto-apply status
router.get('/status', authenticate, getAutoApplyStatus);

export default router;
