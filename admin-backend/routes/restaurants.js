import express from 'express';
import {
  getAllRestaurants,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  updateRestaurantStatus,
  deleteRestaurant
} from '../controllers/adminRestaurantController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', authAdmin, getAllRestaurants);
router.get('/pending', authAdmin, getPendingRestaurants);
router.post('/:id/approve', authAdmin, approveRestaurant);
router.post('/:id/reject', authAdmin, rejectRestaurant);
router.put('/:id/status', authAdmin, updateRestaurantStatus);
router.delete('/:id', authAdmin, deleteRestaurant);

export default router;
