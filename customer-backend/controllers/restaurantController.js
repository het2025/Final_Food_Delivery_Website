import asyncHandler from 'express-async-handler';
import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import MenuCategory from '../models/MenuCategory.js';

// @desc    Get all restaurants with pagination and filters
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; // Increased default limit
    const startIndex = (page - 1) * limit;

    // Build query object
    let query = { status: 'active', isActive: true };

    // --- ADVANCED FILTERING LOGIC ---

    // Filter by MULTIPLE cuisines
    if (req.query.cuisines) {
      const cuisinesArray = req.query.cuisines.split(',').map(c => c.trim());
      query.cuisine = { $in: cuisinesArray };
    }

    // Filter by area
    if (req.query.area) {
      query['location.area'] = { $regex: req.query.area, $options: 'i' };
    }

    // Filter by rating
    if (req.query.minRating) {
      query.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Filter by priceRange (e.g., '₹', '₹₹', '₹₹₹')
    if (req.query.priceRange) {
      query.priceRange = req.query.priceRange;
    }

    // Filter by features (e.g., 'Free Delivery', 'Promoted')
    if (req.query.features) {
      const featuresArray = req.query.features.split(',').map(f => f.trim());
      query.features = { $all: featuresArray };
    }

    // Filter by max delivery time
    if (req.query.maxDeliveryTime) {
      const maxTime = parseInt(req.query.maxDeliveryTime, 10);
      // This requires deliveryTime to be stored as a number or a consistently formatted string.
      // Assuming it's a string like "30 min", we use a regex. For numbers, a different approach is needed.
      // This is a simplified example; a robust solution may need schema changes.
      // Let's assume for now we can do a numeric comparison if we extract the number.
      // This is complex with string-based times, so we will use $where (use with caution).
      query.$expr = { $lte: [{ $toInt: "$deliveryTime" }, maxTime] };
    }

    // Enhanced search logic
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { cuisine: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { 'location.area': { $regex: searchTerm, $options: 'i' } },
        { features: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
        { 'menu.items.name': { $regex: searchTerm, $options: 'i' } },
        { 'menu.items.description': { $regex: searchTerm, $options: 'i' } },
        { 'menu.category': { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // --- SORTING ---
    let sortOption = {};
    // Correctly use 'sortBy' from frontend or 'sort' as a fallback
    const sortBy = req.query.sortBy || req.query.sort;
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'deliveryTime':
        // sort by deliveryTime ascending
        sortOption = { deliveryTime: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'priceLowToHigh':
        sortOption = { priceRange: 1 };
        break;
      case 'priceHighToLow':
        sortOption = { priceRange: -1 };
        break;
      case 'popular':
      default:
        // Default to popular: a mix of rating and reviews
        sortOption = { rating: -1, totalReviews: -1 };
        break;
    }

    // Execute query
    const restaurants = await Restaurant.find(query)
      .select('-menu -__v') // Exclude menu for list view
      .sort(sortOption)
      .limit(limit)
      .skip(startIndex)
      .lean();

    const total = await Restaurant.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      data: restaurants,
    });
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get restaurant by ID with full menu
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurantById = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Fetching restaurant ID:', req.params.id);

    let restaurant = null;
    const db = mongoose.connection.db;

    // Try new_registered_restaurants collection first (for newly registered restaurants)
    const newRestaurantsCollection = db.collection('new_registered_restaurants');

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      restaurant = await newRestaurantsCollection.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        status: 'active',
        isActive: true
      });
      console.log('🔍 Checked new_registered_restaurants:', restaurant ? 'Found' : 'Not found');
    }

    // If not found, try main restaurants collection
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(req.params.id) ? req.params.id : null },
          { restaurantId: req.params.id }
        ],
        status: 'active',
        isActive: true
      }).lean();
      console.log('🔍 Checked restaurants collection:', restaurant ? 'Found' : 'Not found');
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ Found restaurant:', restaurant.name);
    console.log('📊 Raw menu data:', JSON.stringify(restaurant.menu, null, 2));
    console.log('📊 Menu type:', typeof restaurant.menu);
    console.log('📊 Is array:', Array.isArray(restaurant.menu));
    console.log('📊 Menu length:', restaurant.menu?.length);

    // ✅ Process menu - Handle all possible formats
    let processedMenu = [];

    if (restaurant.menu && Array.isArray(restaurant.menu) && restaurant.menu.length > 0) {
      console.log('✅ Menu exists and is array with', restaurant.menu.length, 'items');
      console.log('📊 First item structure:', JSON.stringify(restaurant.menu[0], null, 2));

      const firstItem = restaurant.menu[0];

      // Check if it's category-based structure
      if (firstItem.category && firstItem.items && Array.isArray(firstItem.items)) {
        console.log('✅ Detected category-based menu structure');

        processedMenu = restaurant.menu
          .filter(cat => {
            // Skip invalid categories
            const isValid = cat.category &&
              cat.category !== 'cat_0' &&
              !cat.category.startsWith('cat_') &&
              cat.items &&
              Array.isArray(cat.items) &&
              cat.items.length > 0;

            if (!isValid) {
              console.log('⚠️ Skipping invalid category:', cat.category);
            }
            return isValid;
          })
          .map(cat => {
            console.log('✅ Processing category:', cat.category, 'with', cat.items.length, 'items');
            return {
              category: cat.category,
              items: cat.items.map(item => ({
                name: item.name,
                description: item.description || '',
                price: item.price,
                url: item.url || item.image || '',
                isVeg: item.isVeg !== undefined ? item.isVeg : true,
                isPopular: item.isPopular || false,
                preparationTime: item.preparationTime || 15
              }))
            };
          });

        console.log('✅ Processed', processedMenu.length, 'categories');
      }
      // Handle flat item structure (old format)
      else if (firstItem.name && firstItem.price) {
        console.log('⚠️ Detected flat menu structure, converting to categories');

        const categoryMap = new Map();
        restaurant.menu.forEach(item => {
          let catName = item.category || 'Uncategorized';

          // Fix cat_0
          if (catName === 'cat_0' || catName.startsWith('cat_')) {
            catName = 'Starters';
          }

          if (!categoryMap.has(catName)) {
            categoryMap.set(catName, []);
          }

          categoryMap.get(catName).push({
            name: item.name,
            description: item.description || '',
            price: item.price,
            url: item.url || item.image || '',
            isVeg: item.isVeg !== undefined ? item.isVeg : true,
            isPopular: item.isPopular || false,
            preparationTime: item.preparationTime || 15
          });
        });

        processedMenu = Array.from(categoryMap.entries()).map(([category, items]) => ({
          category,
          items
        }));

        console.log('✅ Converted to', processedMenu.length, 'categories');
      } else {
        console.log('❌ Unknown menu format');
      }
    } else {
      console.log('⚠️ Menu is empty, null, or not an array');
    }

    restaurant.menu = processedMenu;

    // Calculate stats
    let totalItems = 0;
    let vegItems = 0;
    let popularItems = 0;

    processedMenu.forEach(category => {
      if (category.items && Array.isArray(category.items)) {
        totalItems += category.items.length;
        vegItems += category.items.filter(item => item.isVeg).length;
        popularItems += category.items.filter(item => item.isPopular).length;
      }
    });

    restaurant.menuStats = {
      totalCategories: processedMenu.length,
      totalItems,
      vegItems,
      nonVegItems: totalItems - vegItems,
      popularItems
    };

    console.log('✅ Final menu stats:', restaurant.menuStats);
    console.log('📤 Sending', processedMenu.length, 'categories to frontend');

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('❌ Error in getRestaurantById:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ✅ COMPLETELY REWRITTEN: Enhanced search for dish categories
// @desc    Search restaurants by dish/category
// @route   GET /api/restaurants/search/:query
// @access  Public
export const searchRestaurants = asyncHandler(async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50; // Increased limit for better results

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = query.trim();

    // ✅ ENHANCED: Multi-strategy search approach
    const searchQueries = [
      // Strategy 1: Exact dish name matches
      {
        $and: [
          { status: 'active', isActive: true },
          { 'menu.items.name': { $regex: `^${searchTerm}`, $options: 'i' } }
        ]
      },
      // Strategy 2: Dish name contains search term
      {
        $and: [
          { status: 'active', isActive: true },
          { 'menu.items.name': { $regex: searchTerm, $options: 'i' } }
        ]
      },
      // Strategy 3: Category matches
      {
        $and: [
          { status: 'active', isActive: true },
          { 'menu.category': { $regex: searchTerm, $options: 'i' } }
        ]
      },
      // Strategy 4: Restaurant name, cuisine, and other fields
      {
        $and: [
          { status: 'active', isActive: true },
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { cuisine: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
              { description: { $regex: searchTerm, $options: 'i' } },
              { 'location.area': { $regex: searchTerm, $options: 'i' } },
              { features: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
            ]
          }
        ]
      }
    ];

    // Execute all search strategies and combine results
    const searchPromises = searchQueries.map(searchQuery =>
      Restaurant.find(searchQuery)
        .select('-__v')
        .lean()
    );

    const results = await Promise.all(searchPromises);

    // Combine and deduplicate results using Map
    const combinedResults = new Map();
    results.forEach(resultSet => {
      resultSet.forEach(restaurant => {
        if (!combinedResults.has(restaurant._id.toString())) {
          combinedResults.set(restaurant._id.toString(), restaurant);
        }
      });
    });

    // Convert to array and sort by relevance
    let restaurants = Array.from(combinedResults.values());

    // ✅ NEW: Sort by relevance (restaurants with matching menu items first)
    restaurants.sort((a, b) => {
      const aHasMenuItem = a.menu?.some(category =>
        category.items?.some(item =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      const bHasMenuItem = b.menu?.some(category =>
        category.items?.some(item =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      if (aHasMenuItem && !bHasMenuItem) return -1;
      if (!aHasMenuItem && bHasMenuItem) return 1;

      // Secondary sort by rating
      return (b.rating || 0) - (a.rating || 0);
    });

    // Limit results
    restaurants = restaurants.slice(0, limit);

    // ✅ NEW: Add matching menu items info for debugging
    const enrichedResults = restaurants.map(restaurant => {
      const matchingItems = [];
      restaurant.menu?.forEach(category => {
        category.items?.forEach(item => {
          if (item.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
            matchingItems.push({
              category: category.category,
              itemName: item.name
            });
          }
        });
      });

      return {
        ...restaurant,
        menu: undefined, // Remove menu from response for performance
        matchingItems: matchingItems.length > 0 ? matchingItems : undefined
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedResults.length,
      query: searchTerm,
      data: enrichedResults
    });

  } catch (error) {
    console.error('Error in searchRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ✅ NEW: Additional endpoint for menu-specific search
// @desc    Search restaurants by menu items specifically
// @route   GET /api/restaurants/search-menu/:query
// @access  Public
export const searchRestaurantsByMenu = asyncHandler(async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;

    const restaurants = await Restaurant.aggregate([
      {
        $match: {
          status: 'active',
          isActive: true,
          'menu.items.name': { $regex: query, $options: 'i' }
        }
      },
      {
        $addFields: {
          matchingMenuItems: {
            $filter: {
              input: '$menu',
              cond: {
                $anyElementTrue: {
                  $map: {
                    input: '$$this.items',
                    as: 'item',
                    in: {
                      $regexMatch: {
                        input: '$$item.name',
                        regex: query,
                        options: 'i'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $sort: { rating: -1, totalReviews: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          cuisine: 1,
          rating: 1,
          totalReviews: 1,
          deliveryTime: 1,
          location: 1,
          image: 1,
          priceRange: 1,
          features: 1,
          matchingMenuItems: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      query: query,
      data: restaurants
    });

  } catch (error) {
    console.error('Error in searchRestaurantsByMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @desc    Get restaurant menu by ID
// @route   GET /api/restaurants/:id/menu
// @access  Public
export const getRestaurantMenu = asyncHandler(async (req, res) => {
  try {
    const restaurantId = req.params.id;
    console.log('📥 Fetching menu for restaurant ID:', restaurantId);

    const restaurant = await Restaurant.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(restaurantId) ? restaurantId : null },
        { restaurantId: restaurantId }
      ],
      status: 'active',
      isActive: true
    }).select('name _id');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ Found restaurant:', restaurant.name);

    // Get categories
    const categories = await MenuCategory.find({
      restaurant: restaurant._id,
      isActive: true
    }).sort({ sortOrder: 1 });

    console.log(`✅ Found ${categories.length} categories`);

    // Get menu items
    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
      isAvailable: true
    }).populate('category', 'name');

    console.log(`✅ Found ${menuItems.length} menu items`);

    // Group items by category
    const menu = categories.map(category => {
      const categoryItems = menuItems
        .filter(item => item.category && item.category._id.toString() === category._id.toString())
        .map(item => ({
          name: item.name,
          description: item.description,
          price: item.price,
          url: item.image,
          isVeg: item.isVeg,
          isPopular: item.isPopular,
          preparationTime: item.preparationTime
        }));

      return {
        category: category.name,
        items: categoryItems
      };
    }).filter(cat => cat.items.length > 0);

    console.log(`✅ Returning ${menu.length} categories with items`);

    res.status(200).json({
      success: true,
      restaurant: {
        name: restaurant.name,
        id: restaurant._id
      },
      data: menu
    });
  } catch (error) {
    console.error('❌ Error in getRestaurantMenu:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Also export as default object for backward compatibility if needed
export const getAllRestaurants = getRestaurants;
