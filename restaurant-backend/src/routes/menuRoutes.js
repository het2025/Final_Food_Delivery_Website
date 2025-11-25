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

const router = express.Router();

// ✅ All routes require authentication
router.use(authRestaurantOwner);

// ========== CATEGORIES ==========
router.get('/categories', getMenuCategories);
router.post('/categories', createMenuCategory);
router.put('/categories/:id', updateMenuCategory);
router.delete('/categories/:id', deleteMenuCategory);
router.post('/categories/link', linkCategoriesToRestaurant);
router.post('/categories/fix', fixCategoryLinks);



// ========== ITEMS ==========
router.get('/items', getMenuItems);
router.post('/items', createMenuItem);
router.put('/items/:id', updateMenuItem);
router.delete('/items/:id', deleteMenuItem);

export default router;
