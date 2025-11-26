import express from 'express';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  updateOwnerInfo
} from '../controllers/restaurantOwnerProfileController.js';
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';
import { checkApproval } from '../middleware/checkApproval.js';  // ✅ NEW: Check approval status

const router = express.Router();

// All routes require authentication
router.use(authRestaurantOwner);

// Restaurant profile routes
router.get('/restaurant', getRestaurantProfile);  // Read-only, no approval needed
router.put('/restaurant', checkApproval, updateRestaurantProfile);  // ✅ Requires approval

// Owner info routes
router.put('/owner', checkApproval, updateOwnerInfo);  // ✅ Requires approval

export default router;
