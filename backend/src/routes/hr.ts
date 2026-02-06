import express from 'express';
import { getVerifiedHRExperts, getHRExpertCount } from '../controllers/hrController';

const router = express.Router();

router.get('/experts', getVerifiedHRExperts);
router.get('/experts/count', getHRExpertCount);

export default router;
