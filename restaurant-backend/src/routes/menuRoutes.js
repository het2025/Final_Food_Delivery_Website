import express from 'express';
import {
  getMenuCategories,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  linkCategoriesToRestaurant,
  fixCategoryLinks
} from '../controllers/restaurantOwnerMenuController.js';
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js';  // ✅ FIXED: Use correct auth middleware
import { checkApproval } from '../middleware/checkApproval.js';  // ✅ NEW: Check approval status

const router = express.Router();

// ✅ All routes require authentication
router.use(authRestaurantOwner);

// ========== CATEGORIES ==========
router.get('/categories', getMenuCategories);  // Read-only, no approval needed
router.post('/categories', checkApproval, createMenuCategory);  // ✅ Requires approval
router.put('/categories/:id', checkApproval, updateMenuCategory);  // ✅ Requires approval
router.delete('/categories/:id', checkApproval, deleteMenuCategory);  // ✅ Requires approval
router.post('/categories/link', checkApproval, linkCategoriesToRestaurant);  // ✅ Requires approval
router.post('/categories/fix', checkApproval, fixCategoryLinks);  // ✅ Requires approval



// ========== ITEMS ==========
router.get('/items', getMenuItems);  // Read-only, no approval needed
router.post('/items', checkApproval, createMenuItem);  // ✅ Requires approval
router.put('/items/:id', checkApproval, updateMenuItem);  // ✅ Requires approval
router.delete('/items/:id', checkApproval, deleteMenuItem);  // ✅ Requires approval

export default router;
