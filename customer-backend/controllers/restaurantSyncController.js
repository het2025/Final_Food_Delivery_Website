const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

// POST /api/restaurants/sync
const syncRestaurant = async (req, res) => {
  try {
    const restaurantData = req.body;

    console.log('📥 Sync request received for:', restaurantData.name || 'Unknown');
    console.log('📦 Restaurant ID:', restaurantData.restaurantId);

    // ✅ Validate required fields
    if (!restaurantData.restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId is required'
      });
    }

    if (!restaurantData.name) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name is required'
      });
    }

    // ✅ Set defaults for optional fields
    const dataToSync = {
      restaurantId: restaurantData.restaurantId,
      name: restaurantData.name,
      description: restaurantData.description || `Welcome to ${restaurantData.name}!`,
      image: restaurantData.image || '',
      cuisine: Array.isArray(restaurantData.cuisine) && restaurantData.cuisine.length > 0 
        ? restaurantData.cuisine 
        : ['Multi-Cuisine'],
      gstNumber: restaurantData.gstNumber || '',
      deliveryTime: restaurantData.deliveryTime || '30',
      priceRange: restaurantData.priceRange || '₹₹',
      location: {
        area: restaurantData.location?.area || 'City Center',
        address: restaurantData.location?.address || 'Main Road',
        city: restaurantData.location?.city || 'Vadodara',
        state: restaurantData.location?.state || 'Gujarat',
        pincode: restaurantData.location?.pincode || '390001',
        coordinates: restaurantData.location?.coordinates || [0, 0]
      },
      contact: {
        phone: restaurantData.contact?.phone || '',
        email: restaurantData.contact?.email || ''
      },
      rating: restaurantData.rating || 0,
      totalReviews: restaurantData.totalReviews || 0,
      status: restaurantData.status || 'active',
      isActive: restaurantData.isActive !== undefined ? restaurantData.isActive : true,
      isNewlyRegistered: restaurantData.isNewlyRegistered !== undefined ? restaurantData.isNewlyRegistered : true,
      registeredAt: restaurantData.registeredAt || new Date()
    };

    console.log('✅ Data validated and defaults applied');

    // Check if restaurant already exists
    const existing = await Restaurant.findOne({ 
      restaurantId: dataToSync.restaurantId 
    });

    if (existing) {
      console.log('🔄 Restaurant exists, updating...');
      
      const updated = await Restaurant.findOneAndUpdate(
        { restaurantId: dataToSync.restaurantId },
        { $set: dataToSync },
        { new: true, runValidators: true }
      );

      console.log('✅ Restaurant updated:', updated.name);
      
      return res.json({
        success: true,
        data: updated,
        message: 'Restaurant updated successfully'
      });
    }

    // Create new restaurant
    console.log('✨ Creating new restaurant...');
    
    const newRestaurant = await Restaurant.create(dataToSync);
    
    console.log('✅ ========================================');
    console.log('✅ NEW RESTAURANT CREATED IN CUSTOMER DB!');
    console.log('✅ ========================================');
    console.log('📍 Name:', newRestaurant.name);
    console.log('📍 ID:', newRestaurant._id);
    console.log('📍 Restaurant ID:', newRestaurant.restaurantId);

    res.status(201).json({
      success: true,
      data: newRestaurant,
      message: 'Restaurant synced successfully'
    });

  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌ SYNC ERROR');
    console.error('❌ ========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', messages);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + messages.join(', '),
        errors: messages
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error - restaurant already exists');
      return res.status(409).json({
        success: false,
        message: 'Restaurant with this ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to sync restaurant',
      error: error.message
    });
  }
};

// GET /api/restaurants/newly-registered
const getNewlyRegisteredRestaurants = async (req, res) => {
  try {
    console.log('🔍 Fetching newly registered restaurants...');

    // ✅ FIXED: Query ONLY the new_registered_restaurants collection directly
    const db = mongoose.connection.db;
    const newRestaurantsCollection = db.collection('new_registered_restaurants');
    
    const restaurants = await newRestaurantsCollection.find({
      status: 'active',
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

    console.log(`✅ Found ${restaurants.length} newly registered restaurants from new_registered_restaurants collection`);

    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length,
      message: 'Newly registered restaurants retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching newly registered restaurants:', error);
    res.status(500).json({
      success: false,
      data: [],
      count: 0,
      message: 'Failed to retrieve restaurants',
      error: error.message
    });
  }
};

module.exports = {
  syncRestaurant,
  getNewlyRegisteredRestaurants
};
