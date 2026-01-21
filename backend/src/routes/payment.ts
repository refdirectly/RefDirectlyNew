import express from 'express';
import { authenticate } from '../middleware/auth';
import * as paymentController from '../controllers/paymentController';

const router = express.Router();

router.post('/create-order', authenticate, paymentController.createOrder);

export default router;
