import express from 'express';
import { getTransactions, exportTransactions } from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All transaction routes require authentication
router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/export', exportTransactions);

export default router;