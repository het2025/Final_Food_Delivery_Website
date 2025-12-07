import express from 'express';
import {
  registerRestaurantOwner,
  loginRestaurantOwner,
  getCurrentRestaurantOwner,
  updateRestaurantOwnerProfile,
  updateRestaurantOwnerPassword
} from '../controllers/restaurantOwnerAuthController.js';  // Ensure controller exists
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';  // Middleware verifies JWT, sets req.user

import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes (no auth)
router.post('/register', upload.single('image'), registerRestaurantOwner);  // Creates RestaurantOwner, auto-logs in
router.post('/login', loginRestaurantOwner);  // Validates creds, returns token

// Protected routes (require valid token)
router.get('/me', authRestaurantOwner, getCurrentRestaurantOwner);  // Returns current user profile
router.put('/profile', authRestaurantOwner, updateRestaurantOwnerProfile);  // Updates user info (e.g., name, email)
router.put('/password', authRestaurantOwner, updateRestaurantOwnerPassword);  // Updates password (old/new validation)

export default router;
