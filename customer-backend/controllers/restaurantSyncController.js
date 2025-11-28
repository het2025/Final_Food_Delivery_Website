import Restaurant from '../models/Restaurant.js';
import mongoose from 'mongoose';

// POST /api/restaurants/sync
export const syncRestaurant = async (req, res) => {
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
      ownerName: restaurantData.ownerName || '',
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

    const db = mongoose.connection.db;
    const restaurantsCollection = db.collection('restaurants');
    const newRestaurantsCollection = db.collection('new_registered_restaurants');

    // ✅ FIXED: Check for duplicates using BOTH _id and restaurantId
    // Build query to check multiple identifiers
    const idQuery = [];

    // Check restaurantId (string)
    if (dataToSync.restaurantId) {
      idQuery.push({ restaurantId: dataToSync.restaurantId });
    }

    // Check _id (ObjectId) - important because restaurant-backend sends this!
    if (restaurantData._id) {
      const objectId = new mongoose.Types.ObjectId(restaurantData._id);
      idQuery.push({ _id: objectId });
    }

    // If we have no identifiers to check, reject the request
    if (idQuery.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid identifier (_id or restaurantId) provided'
      });
    }

    // 1. Check if it exists in MAIN collection (Approved)
    const existingMain = await restaurantsCollection.findOne({ $or: idQuery });

    if (existingMain) {
      console.log('🔄 Restaurant found in MAIN collection, updating...');
      await restaurantsCollection.updateOne(
        { _id: existingMain._id },
        { $set: dataToSync }
      );
      console.log('✅ Main restaurant updated');
      return res.json({ success: true, message: 'Restaurant updated in main collection' });
    }

    // 2. Check if it exists in PENDING collection (Unapproved)
    const existingPending = await newRestaurantsCollection.findOne({ $or: idQuery });

    if (existingPending) {
      console.log('🔄 Restaurant found in PENDING collection, updating...');
      await newRestaurantsCollection.updateOne(
        { _id: existingPending._id },
        { $set: dataToSync }
      );
      console.log('✅ Pending restaurant updated');
      return res.json({ success: true, message: 'Restaurant updated in pending collection', data: existingPending });
    }

    // 3. New Restaurant -> Insert into PENDING collection
    console.log('✨ Creating new restaurant in PENDING collection...');
    // Ensure _id is set if provided, or let Mongo generate it?
    // Mongoose models usually handle _id. Here we use raw driver.
    // If restaurantData has _id, use it.
    if (restaurantData._id) {
      dataToSync._id = new mongoose.Types.ObjectId(restaurantData._id);
    }

    await newRestaurantsCollection.insertOne(dataToSync);

    console.log('✅ ========================================');
    console.log('✅ NEW RESTAURANT CREATED IN PENDING DB!');
    console.log('✅ ========================================');

    res.status(201).json({
      success: true,
      data: dataToSync,
      message: 'Restaurant synced to pending collection'
    });

  } catch (error) {
    console.error('❌ Sync Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync restaurant',
      error: error.message
    });
  }
};

// GET /api/restaurants/newly-registered
export const getNewlyRegisteredRestaurants = async (req, res) => {
  try {
    console.log('🔍 Fetching newly registered restaurants...');

    // ✅ FIXED: Query 'new_registered_restaurants' collection as requested by user
    // We will ensure Admin Approval keeps the record here with status='active'
    const db = mongoose.connection.db;
    const newRestaurantsCollection = db.collection('new_registered_restaurants');

    const restaurants = await newRestaurantsCollection.find({
      status: 'active',
      isActive: true
    })
      .sort({ approvedAt: -1, createdAt: -1 })
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
