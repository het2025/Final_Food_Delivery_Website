import express from 'express';
import {
  getAllOrders,
  getOrdersByRestaurant,
  getOrdersByRestaurantId,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getSampleOrder  // Add this
} from '../controllers/adminOrderController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', authAdmin, getAllOrders);
router.get('/by-restaurant', authAdmin, getOrdersByRestaurant);
router.get('/restaurant/:restaurantId', authAdmin, getOrdersByRestaurantId);
router.get('/stats', authAdmin, getOrderStats);
router.get('/debug/sample', authAdmin, getSampleOrder);  // Add this debug route
router.get('/:id', authAdmin, getOrderById);
router.put('/:id/status', authAdmin, updateOrderStatus);
router.put('/:id/cancel', authAdmin, cancelOrder);

export default router;
