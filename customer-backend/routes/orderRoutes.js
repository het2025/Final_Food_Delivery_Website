const express = require('express');
const router = express.Router();

const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder, 
  rateOrder,
  updateOrderStatus,
  validateCoupon
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

// ✅ Route called by restaurant backend (no auth required)
// PUT /api/orders/:id/update-status
router.put('/:id/update-status', updateOrderStatus);

// All following routes require authentication
router.use(protect);

// Create new order
router.post('/', createOrder);

// Get my orders
router.get('/my-orders', getMyOrders);

// Get single order
router.get('/:orderId', getOrderById);

// Cancel order
router.patch('/:orderId/cancel', cancelOrder);

// Rate order
router.post('/:orderId/rate', rateOrder);

// Validate a coupon code
router.post('/validate-coupon', validateCoupon);

module.exports = router;
