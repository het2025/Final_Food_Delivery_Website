import express from 'express';
import {
  updateProfile,
  toggleOnlineStatus,
  toggleAvailability,
  getEarnings
} from '../controllers/deliveryProfileController.js';
import { authDelivery } from '../middleware/deliveryAuth.js';

const router = express.Router();

router.put('/', authDelivery, updateProfile);
router.put('/online', authDelivery, toggleOnlineStatus);
router.put('/availability', authDelivery, toggleAvailability);
router.get('/earnings', authDelivery, getEarnings);

export default router;
