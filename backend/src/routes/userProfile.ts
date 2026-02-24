import express from 'express';
import { authenticate } from '../middleware/auth';
import * as userProfileController from '../controllers/userProfileController';

const router = express.Router();

router.get('/', authenticate, userProfileController.getUserProfile);
router.put('/', authenticate, userProfileController.createOrUpdateProfile);
router.delete('/', authenticate, userProfileController.deleteProfile);

export default router;
