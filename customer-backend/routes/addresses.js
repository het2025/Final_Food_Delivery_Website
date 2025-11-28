import express from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
