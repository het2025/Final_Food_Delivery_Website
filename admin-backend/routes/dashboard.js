import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/adminDashboardController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/stats', authAdmin, getDashboardStats);
router.get('/activity', authAdmin, getRecentActivity);

export default router;
