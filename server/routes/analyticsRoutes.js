import express from 'express';
import { getAnalyticsData, getAnalyticsSummary } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Get comprehensive analytics data
router.get('/', getAnalyticsData);

// Get analytics summary/overview
router.get('/summary', getAnalyticsSummary);

export default router;