import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { syncAdzunaJobs, getJobsWithReferrers, getJobDetails } from '../controllers/adzunaController';

const router = express.Router();

// Public routes
router.get('/jobs', getJobsWithReferrers);
router.get('/jobs/:jobId', getJobDetails);

// Admin only - sync jobs from Adzuna
router.post('/sync', authMiddleware, adminMiddleware, syncAdzunaJobs);

export default router;
