import express from 'express';
import { authenticate } from '../middleware/auth';
import * as profileController from '../controllers/profileController';

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);
router.get('/completeness', authenticate, profileController.getProfileCompleteness);
router.get('/search', authenticate, profileController.searchProfiles);

export default router;
