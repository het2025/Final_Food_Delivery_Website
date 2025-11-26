import { findRestaurantByOwner } from '../models/Restaurant.js';
import mongoose from 'mongoose';

// Helper: Get restaurant for owner
const getRestaurant = async (restaurantOwnerId) => {
  const restaurant = await findRestaurantByOwner(restaurantOwnerId);
  return restaurant;
};

// ========== CATEGORIES (From Embedded Menu) ==========

// GET /api/menu/categories
export const getMenuCategories = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;

    const restaurant = await getRestaurant(restaurantOwnerId);

    if (!restaurant) {
      console.warn('⚠️ getMenuCategories: No restaurant found for owner:', restaurantOwnerId);
      return res.json({
        success: true,
        data: [],
        message: 'No restaurant found. Create your restaurant profile first.'
      });
    }

    console.log('✅ getMenuCategories: Found restaurant:', restaurant._id, 'Name:', restaurant.name);

    // ✅ Extract unique categories from embedded menu
    let existingCategories = [];

    if (restaurant.menu && Array.isArray(restaurant.menu)) {
      // Check if menu uses category structure (new format)
      if (restaurant.menu.length > 0 && restaurant.menu[0].category) {
        existingCategories = restaurant.menu
          .map(cat => cat.category)
          .filter(name => name && name.trim() !== '');
      }
    }

    console.log('📊 Existing categories from menu:', existingCategories);

    // ✅ Default categories to always show
    const defaultCategories = [
      'Starters',
      'Main Course',
      'Desserts',
      'Beverages',
      'Breads',
      'Rice & Biryani'
    ];

    // Combine existing + defaults (remove duplicates)
    const allCategories = [...new Set([...existingCategories, ...defaultCategories])];

    // ✅ Filter out any invalid category names
    const validCategories = allCategories.filter(name =>
      name &&
      name.trim() !== '' &&
      !name.startsWith('cat_')  // Remove any cat_0, cat_1, etc.
    );

    // Transform to category objects for frontend
    const categoryObjects = validCategories.map((name, index) => ({
      _id: `cat_${index}`,  // Only use cat_ for _id, not for name
      name,  // This is the actual category name like "Starters"
      isActive: true
    }));

    console.log(`✅ Returning ${categoryObjects.length} valid categories`);

    res.json({
      success: true,
      data: categoryObjects,
      message: 'Categories loaded successfully'
    });

  } catch (error) {
    console.error('❌ getMenuCategories error:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'Failed to load categories',
      error: error.message
    });
  }
};

// POST /api/menu/categories
export const createMenuCategory = async (req, res) => {
  try {
    // Categories are created automatically when menu items are added
    // This endpoint exists for compatibility but doesn't create separate documents
    res.json({
      success: true,
      message: 'Categories are managed automatically through menu items'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// ========== MENU ITEMS (Embedded in Restaurant) ==========

// GET /api/menu/items
export const getMenuItems = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { categoryId } = req.query;

    const restaurant = await getRestaurant(restaurantOwnerId);

    if (!restaurant) {
      return res.json({
        success: true,
        data: [],
        message: 'No restaurant found'
      });
    }

    console.log('🔍 Loading menu items. Menu structure:', restaurant.menu?.length || 0, 'categories');

    let items = [];

    // ✅ Handle category-based menu structure
    if (restaurant.menu && Array.isArray(restaurant.menu)) {
      restaurant.menu.forEach(category => {
        if (category.items && Array.isArray(category.items)) {
          // Add category info to each item
          const categoryItems = category.items.map(item => ({
            ...item.toObject ? item.toObject() : item,
            _id: item._id || `item_${Date.now()}_${Math.random()}`,
            category: category.category,
            categoryName: category.category
          }));
          items.push(...categoryItems);
        }
      });
    }

    // Filter by category if provided
    if (categoryId) {
      const categoryName = categoryId.replace('cat_', '');
      items = items.filter(item => item.category === categoryName || item.categoryName === categoryName);
    }

    console.log(`✅ Returning ${items.length} menu items`);

    res.json({
      success: true,
      data: items,
      message: 'Menu items loaded successfully'
    });

  } catch (error) {
    console.error('❌ getMenuItems error:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: 'Failed to load menu items',
      error: error.message
    });
  }
};

export const createMenuItem = async (req, res) => {
  console.log('🚀 ===== CREATE MENU ITEM API CALLED =====');
  console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
  console.log('👤 Restaurant Owner ID:', req.restaurantOwner?.id);
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const {
      name,
      description,
      price,
      category,
      isVeg = true,
      isPopular = false,
      image = '',
      preparationTime = 15
    } = req.body;

    console.log('📥 Received menu item data:', { name, category, price, isVeg });

    // Validate required fields
    if (!name || !price || !category) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    // Get restaurant
    const restaurant = await getRestaurant(restaurantOwnerId);

    if (!restaurant) {
      console.log('❌ No restaurant found');
      return res.status(400).json({
        success: false,
        message: 'No restaurant found. Create your restaurant profile first.'
      });
    }

    console.log('✅ Found restaurant:', restaurant.name);
    console.log('📊 Current menu structure:', JSON.stringify(restaurant.menu, null, 2));

    // Initialize menu if it doesn't exist
    if (!restaurant.menu) {
      restaurant.menu = [];
      console.log('✅ Initialized empty menu array');
    }

    // Create new menu item object
    const newItem = {
      name: name.trim(),
      description: description?.trim() || '',
      price: parseFloat(price),
      url: image || '',
      image: image || '',
      isVeg: Boolean(isVeg),
      isPopular: Boolean(isPopular),
      preparationTime: parseInt(preparationTime) || 15
    };

    console.log('📦 New item object:', newItem);

    // Find existing category or create new one
    let categoryIndex = restaurant.menu.findIndex(cat =>
      cat.category && cat.category.trim() === category.trim()
    );

    if (categoryIndex === -1) {
      // Category doesn't exist, create new category with this item
      console.log('➕ Creating new category:', category.trim());

      restaurant.menu.push({
        category: category.trim(),
        items: [newItem]
      });

      categoryIndex = restaurant.menu.length - 1;
      console.log('✅ Added new category at index:', categoryIndex);
    } else {
      // Category exists, add item to it
      console.log('📝 Adding to existing category at index:', categoryIndex);

      if (!restaurant.menu[categoryIndex].items) {
        restaurant.menu[categoryIndex].items = [];
      }

      restaurant.menu[categoryIndex].items.push(newItem);
      console.log('✅ Item added to category');
    }

    console.log('📊 Updated menu structure:', JSON.stringify(restaurant.menu, null, 2));

    // ✅ CRITICAL: Mark the menu field as modified so Mongoose saves it
    restaurant.markModified('menu');

    // Save to database
    const savedRestaurant = await restaurant.save();
    console.log('✅ Restaurant saved to database');
    console.log('📊 Final menu length:', savedRestaurant.menu.length);

    // Get the added item (last item in the category)
    const addedItem = savedRestaurant.menu[categoryIndex].items[
      savedRestaurant.menu[categoryIndex].items.length - 1
    ];

    console.log('✅ Menu item created successfully:', addedItem.name);

    res.status(201).json({
      success: true,
      data: {
        ...addedItem,
        _id: addedItem._id || `item_${Date.now()}`,
        category: category.trim(),
        categoryName: category.trim()
      },
      message: 'Menu item created successfully'
    });

  } catch (error) {
    console.error('❌ createMenuItem error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message
    });
  }
};

// PUT /api/menu/items/:id
export const updateMenuItem = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { id } = req.params;  // This will be the array index or _id from subdocument
    const updates = req.body;

    const restaurant = await getRestaurant(restaurantOwnerId);

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: 'No restaurant found'
      });
    }

    // Find item by _id (Mongoose subdocument _id)
    const item = restaurant.menu.id(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Update fields
    if (updates.name !== undefined) item.name = updates.name.trim();
    if (updates.description !== undefined) item.description = updates.description.trim();
    if (updates.price !== undefined) item.price = parseFloat(updates.price);
    if (updates.isAvailable !== undefined) item.isAvailable = Boolean(updates.isAvailable);
    if (updates.isPopular !== undefined) item.isPopular = Boolean(updates.isPopular);
    if (updates.image !== undefined) item.image = updates.image;
    if (updates.preparationTime !== undefined) item.preparationTime = parseInt(updates.preparationTime);

    await restaurant.save();

    console.log('✅ Menu item updated:', item.name);

    res.json({
      success: true,
      data: item,
      message: 'Menu item updated successfully'
    });

  } catch (error) {
    console.error('updateMenuItem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message
    });
  }
};

// DELETE /api/menu/items/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { id } = req.params;

    const restaurant = await getRestaurant(restaurantOwnerId);

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: 'No restaurant found'
      });
    }

    // Remove item from embedded array
    const item = restaurant.menu.id(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    item.remove();  // Mongoose subdocument method
    await restaurant.save();

    console.log('✅ Menu item deleted from embedded menu');

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('deleteMenuItem error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message
    });
  }
};

// Export all functions
export const updateMenuCategory = createMenuCategory;  // Dummy for compatibility
export const deleteMenuCategory = createMenuCategory;  // Dummy for compatibility
export const fixCategoryLinks = (req, res) => res.json({ success: true, message: 'Not needed with embedded menu' });
export const linkCategoriesToRestaurant = fixCategoryLinks;
