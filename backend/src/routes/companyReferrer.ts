import express from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/companyReferrerController';

const router = express.Router();

// Search endpoints
router.get('/referrers/search', controller.searchReferrersByCompany);
router.get('/hrs/search', controller.searchHRsByCompany);
router.get('/companies/stats', controller.getCompaniesWithCounts);

// Add endpoints (admin/authenticated)
router.post('/referrers/add', authenticate, controller.addReferrerToCompany);
router.post('/hrs/add', authenticate, controller.addHRToCompany);
router.post('/referrers/verify', authenticate, controller.verifyReferrerForCompany);

export default router;
