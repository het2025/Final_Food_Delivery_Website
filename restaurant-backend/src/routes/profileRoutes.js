import express from 'express';
import { 
  getRestaurantProfile, 
  updateRestaurantProfile,
  updateOwnerInfo 
} from '../controllers/restaurantOwnerProfileController.js';
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';

const router = express.Router();

// All routes require authentication
router.use(authRestaurantOwner);

// Restaurant profile routes
router.get('/restaurant', getRestaurantProfile);
router.put('/restaurant', updateRestaurantProfile);

// Owner info routes
router.put('/owner', updateOwnerInfo);

export default router;
