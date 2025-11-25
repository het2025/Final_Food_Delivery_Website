const express = require('express');
const router = express.Router();

// ✅ IMPORT THE NEW SYNC CONTROLLER (sync endpoints)
const {
  syncRestaurant,
  getNewlyRegisteredRestaurants
} = require('../controllers/restaurantSyncController');

// Import restaurantController as an object and pick functions with fallbacks
const restaurantController = require('../controllers/restaurantController');

const getAllRestaurants = restaurantController.getAllRestaurants || restaurantController.getRestaurants || restaurantController.getRestaurants;
const getRestaurantById = restaurantController.getRestaurantById || restaurantController.getById || restaurantController.getRestaurantById;
const searchRestaurants = restaurantController.searchRestaurants || restaurantController.search || restaurantController.searchRestaurants;
const searchRestaurantsByMenu = restaurantController.searchRestaurantsByMenu || restaurantController.searchRestaurantsByMenu;
const getRestaurantMenu = restaurantController.getRestaurantMenu || restaurantController.getMenu || restaurantController.getRestaurantMenu;

// ✅ NEW ROUTES (Add these at the TOP)
router.post('/sync', syncRestaurant);
router.get('/newly-registered', getNewlyRegisteredRestaurants);

// ✅ IMPORTANT: More specific routes should come BEFORE generic ones

// @desc    Search restaurants by menu items specifically
// @route   GET /api/restaurants/search-menu/:query
// @access  Public
router.get('/search-menu/:query', searchRestaurantsByMenu);

// @desc    Search restaurants (general search)
// @route   GET /api/restaurants/search/:query
// @access  Public
router.get('/search/:query', searchRestaurants);

// ✅ NEW: Get all unique cuisines for filter dropdown
// @route   GET /api/restaurants/cuisines
// @access  Public
router.get('/cuisines', async (req, res) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const cuisines = await Restaurant.distinct('cuisine', {
      status: 'active',
      isActive: true
    });

    // Flatten array of arrays and remove duplicates
    const uniqueCuisines = [...new Set(cuisines.flat())].sort();

    res.status(200).json({
      success: true,
      data: uniqueCuisines
    });
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cuisines'
    });
  }
});

// ✅ NEW: Get all unique areas for location filter
// @route   GET /api/restaurants/areas
// @access  Public
router.get('/areas', async (req, res) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const areas = await Restaurant.distinct('location.area', {
      status: 'active',
      isActive: true
    });

    const uniqueAreas = [...new Set(areas)].filter(area => area).sort();

    res.status(200).json({
      success: true,
      data: uniqueAreas
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching areas'
    });
  }
});

// ✅ NEW: Search by cuisine type
// @route   GET /api/restaurants/by-cuisine/:cuisine
// @access  Public
router.get('/by-cuisine/:cuisine', async (req, res) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const { cuisine } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;

    const restaurants = await Restaurant.find({
      status: 'active',
      isActive: true,
      cuisine: { $elemMatch: { $regex: cuisine, $options: 'i' } }
    })
      .select('-menu -__v')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: restaurants.length,
      cuisine: cuisine,
      data: restaurants
    });
  } catch (error) {
    console.error('Error searching by cuisine:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching by cuisine'
    });
  }
});

// ✅ NEW: Search by area
// @route   GET /api/restaurants/by-area/:area
// @access  Public
router.get('/by-area/:area', async (req, res) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const { area } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;

    const restaurants = await Restaurant.find({
      status: 'active',
      isActive: true,
      'location.area': { $regex: area, $options: 'i' }
    })
      .select('-menu -__v')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: restaurants.length,
      area: area,
      data: restaurants
    });
  } catch (error) {
    console.error('Error searching by area:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching by area'
    });
  }
});

// ✅ NEW: Advanced search with multiple filters
// @route   POST /api/restaurants/advanced-search
// @access  Public
router.post('/advanced-search', async (req, res) => {
  try {
    const Restaurant = require('../models/Restaurant');
    const {
      query,
      cuisines = [],
      areas = [],
      minRating = 0,
      maxPrice,
      isVeg,
      sortBy = 'rating'
    } = req.body;

    let searchQuery = { status: 'active', isActive: true };

    // Text search
    if (query && query.trim()) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { 'menu.items.name': { $regex: query, $options: 'i' } },
        { cuisine: { $elemMatch: { $regex: query, $options: 'i' } } }
      ];
    }

    // Cuisine filter
    if (Array.isArray(cuisines) && cuisines.length > 0) {
      searchQuery.cuisine = { $in: cuisines };
    }

    // Area filter
    if (Array.isArray(areas) && areas.length > 0) {
      searchQuery['location.area'] = { $in: areas };
    }

    // Rating filter
    if (minRating > 0) {
      searchQuery.rating = { $gte: minRating };
    }

    // Sort options
    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'reviews':
        sortOption = { totalReviews: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { rating: -1 };
    }

    const restaurants = await Restaurant.find(searchQuery)
      .select('-menu -__v')
      .sort(sortOption)
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: restaurants.length,
      filters: { query, cuisines, areas, minRating, sortBy },
      data: restaurants
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({
      success: false,
      message: 'Error in advanced search'
    });
  }
});

// @desc    Get all restaurants with pagination and filters
// @route   GET /api/restaurants
// @access  Public
router.get('/', getAllRestaurants);

// @desc    Get restaurant menu by ID
// @route   GET /api/restaurants/:id/menu
// @access  Public
router.get('/:id/menu', getRestaurantMenu);

// @desc    Get restaurant by ID (full details) - MUST BE LAST
// @route   GET /api/restaurants/:id
// @access  Public
router.get('/:id', getRestaurantById);

// ✅ EXPORT
module.exports = router;
