import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Create order endpoint - Coming soon'
  });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Get user orders - Coming soon',
    data: []
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Get order ${req.params.id} - Coming soon`,
    data: {}
  });
});

export default router;
