import express from 'express';
import {
  getRestaurantOwnerOrders,
  updateRestaurantOwnerOrderStatus,
  getRestaurantOwnerOrderById,
  receiveOrderFromCustomer,
  rejectOrder,
  acceptOrder
} from '../controllers/restaurantOwnerOrderController.js';
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';

const router = express.Router();

// ✅ NEW: Public route to receive orders from customer backend (NO AUTH)
router.post('/receive', receiveOrderFromCustomer);

// All other routes require restaurant owner auth
router.use(authRestaurantOwner);

// GET /api/restaurant/orders
router.get('/', getRestaurantOwnerOrders);

// GET /api/restaurant/orders/:id
router.get('/:id', getRestaurantOwnerOrderById);

// PUT /api/restaurant/orders/:id/status
router.put('/:id/status', updateRestaurantOwnerOrderStatus);

// Add these new routes at the end
router.put('/:id/accept', updateRestaurantOwnerOrderStatus);  // Existing
router.put('/:id/reject', rejectOrder);  // ✅ NEW - Add this import and route


export default router;
