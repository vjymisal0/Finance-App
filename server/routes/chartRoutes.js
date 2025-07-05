import express from 'express';
import { getChartData, getChartSummary } from '../controllers/chartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All chart routes require authentication
router.use(authenticateToken);

// Get chart data for different periods
router.get('/data', getChartData);

// Get chart summary/highlights
router.get('/summary', getChartSummary);

export default router;