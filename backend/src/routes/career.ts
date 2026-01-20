import express from 'express';
import { authenticate, adminMiddleware } from '../middleware/auth';
import {
  getActiveJobs,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  submitApplication,
  getAllApplications,
  updateApplicationStatus
} from '../controllers/careerController';

const router = express.Router();

// Public routes
router.get('/jobs', getActiveJobs);
router.post('/applications', submitApplication);

// Admin routes
router.get('/admin/jobs', authenticate, adminMiddleware, getAllJobs);
router.post('/admin/jobs', authenticate, adminMiddleware, createJob);
router.put('/admin/jobs/:id', authenticate, adminMiddleware, updateJob);
router.delete('/admin/jobs/:id', authenticate, adminMiddleware, deleteJob);
router.get('/admin/applications', authenticate, adminMiddleware, getAllApplications);
router.put('/admin/applications/:id', authenticate, adminMiddleware, updateApplicationStatus);

export default router;
