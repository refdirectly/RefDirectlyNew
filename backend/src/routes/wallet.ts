import express from 'express';
import { getWallet, addFunds, withdraw, getTransactions } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getWallet);
router.post('/add-funds', authenticate, addFunds);
router.post('/withdraw', authenticate, withdraw);
router.get('/transactions', authenticate, getTransactions);

export default router;
