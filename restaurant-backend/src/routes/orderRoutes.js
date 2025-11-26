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
import { checkApproval } from '../middleware/checkApproval.js';  // ✅ NEW: Check approval status

const router = express.Router();

// ✅ NEW: Public route to receive orders from customer backend (NO AUTH)
router.post('/receive', receiveOrderFromCustomer);

// All other routes require restaurant owner auth
router.use(authRestaurantOwner);

// GET /api/restaurant/orders
router.get('/', getRestaurantOwnerOrders);  // Read-only, no approval needed

// GET /api/restaurant/orders/:id
router.get('/:id', getRestaurantOwnerOrderById);  // Read-only, no approval needed

// PUT /api/restaurant/orders/:id/status
router.put('/:id/status', checkApproval, updateRestaurantOwnerOrderStatus);  // ✅ Requires approval

// Add these new routes at the end
router.put('/:id/accept', checkApproval, updateRestaurantOwnerOrderStatus);  // ✅ Requires approval
router.put('/:id/reject', checkApproval, rejectOrder);  // ✅ Requires approval


export default router;
