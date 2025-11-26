const express = require('express');
const router = express.Router();

const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder, 
  rateOrder,
  updateOrderStatus,
  validateCoupon,
  getReadyOrders
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

// Internal route to get ready orders (for delivery polling)
router.get('/internal/ready', getReadyOrders);

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
