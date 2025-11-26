import express from 'express';
import {
  createDeliveryOrder,
  getAvailableOrders,
  acceptOrder,
  rejectOrder,
  pickupOrder,
  startTransit,
  completeDelivery,
  getCurrentOrder,
  getDeliveryHistory,
  updateLocation
} from '../controllers/deliveryOrderController.js';
import { authDelivery } from '../middleware/deliveryAuth.js';

const router = express.Router();

// Internal API - no auth needed (called by customer-backend)
router.post('/create', createDeliveryOrder);

// Delivery boy routes (require auth)
router.get('/available', authDelivery, getAvailableOrders);
router.get('/current', authDelivery, getCurrentOrder);
router.get('/history', authDelivery, getDeliveryHistory);
router.post('/:orderId/accept', authDelivery, acceptOrder);
router.post('/:orderId/reject', authDelivery, rejectOrder);
router.post('/:orderId/pickup', authDelivery, pickupOrder);
router.post('/:orderId/transit', authDelivery, startTransit);
router.post('/:orderId/complete', authDelivery, completeDelivery);
router.put('/location', authDelivery, updateLocation);

export default router;
