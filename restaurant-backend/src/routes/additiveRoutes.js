import express from 'express';
import { getAdditives, createAdditive, updateAdditive, deleteAdditive } from '../controllers/restaurantOwnerAdditiveController.js';
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';

const router = express.Router();
router.use(authRestaurantOwner);

router.get('/', getAdditives);
router.post('/', createAdditive);
router.put('/:id', updateAdditive);
router.delete('/:id', deleteAdditive);

export default router;
