import express from 'express';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  updateOwnerInfo,
  addBankAccount,       // ✅ Computed
  getBankAccounts,      // ✅ Computed
  deleteBankAccount     // ✅ NEW
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

// ✅ Bank Account Routes
router.post('/bank-account', checkApproval, addBankAccount);
router.get('/bank-account', getBankAccounts);
router.delete('/bank-account/:id', checkApproval, deleteBankAccount); // ✅ NEW

export default router;
