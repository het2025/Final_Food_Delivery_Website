import express from 'express';
import {
    getAnalyticsOverview,
    getOrderStatusDistribution,
    getOrdersTrend,
    getOrdersByDayOfWeek,
    getPeakHours,
    getTopRestaurants,
    getPaymentSplit
} from '../controllers/adminAnalyticsController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authAdmin);

// Analytics endpoints
router.get('/overview', getAnalyticsOverview);
router.get('/order-status', getOrderStatusDistribution);
router.get('/orders-trend', getOrdersTrend);
router.get('/orders-by-day', getOrdersByDayOfWeek);
router.get('/peak-hours', getPeakHours);
router.get('/top-restaurants', getTopRestaurants);
router.get('/payment-split', getPaymentSplit);

export default router;
