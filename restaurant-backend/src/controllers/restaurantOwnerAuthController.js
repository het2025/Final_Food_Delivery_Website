import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { RestaurantOwner } from '../models/RestaurantOwner.js';
import { Restaurant } from '../models/Restaurant.js';
import { uploadToCloudinary } from '../utils/cloudinaryHelper.js';

// POST /api/auth/register
export const registerRestaurantOwner = async (req, res) => {
  try {
    // Parse restaurant data if it comes as a JSON string (FormData limitation)
    let { name, email, password, phone, restaurant } = req.body;

    if (typeof restaurant === 'string') {
      try {
        restaurant = JSON.parse(restaurant);
      } catch (e) {
        console.error('Error parsing restaurant JSON:', e);
        return res.status(400).json({ success: false, message: 'Invalid restaurant data format' });
      }
    }

    console.log('📥 Registration request received');
    console.log('Owner data:', { name, email, phone });
    console.log('Restaurant data:', restaurant);

    // ✅ Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (!restaurant || !restaurant.name) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name is required'
      });
    }

    if (!restaurant.location || !restaurant.location.area || !restaurant.location.address) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant location (area and address) is required'
      });
    }

    // ✅ Check existing user
    const existingOwner = await RestaurantOwner.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: `User with this ${existingOwner.email === email ? 'email' : 'phone'} already exists`
      });
    }

    // ✅ Create Restaurant Owner
    console.log('Creating restaurant owner...');
    const restaurantOwner = await RestaurantOwner.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      isApproved: false  // ✅ NEW: Requires admin approval
    });

    // Prevent duplicate restaurants for a given owner
    const existingRestaurant = await Restaurant.findOne({
      owner: restaurantOwner._id
    });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'You already have a restaurant registered.'
      });
    }


    console.log('✅ Restaurant owner created:', restaurantOwner._id);

    // ✅ FIXED: Prepare cuisine array (ensure never empty)
    let cuisineArray = ['Multi-Cuisine'];
    if (restaurant.cuisine) {
      if (Array.isArray(restaurant.cuisine)) {
        const filtered = restaurant.cuisine.filter(c => c && c.trim());
        if (filtered.length > 0) cuisineArray = filtered;
      } else if (typeof restaurant.cuisine === 'string') {
        const filtered = restaurant.cuisine.split(',').map(c => c.trim()).filter(c => c);
        if (filtered.length > 0) cuisineArray = filtered;
      }
    }

    // ✅ Upload Image if provided
    let imageUrl = '';
    if (req.file) {
      console.log('📸 Uploading image to Cloudinary...');
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, 'restaurants');
        console.log('✅ Image uploaded:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        // Continue without image or return error? Let's continue but warn.
      }
    } else if (restaurant.image) {
      imageUrl = restaurant.image; // Use provided URL if no file
    }

    // ✅ Create Restaurant
    console.log('Creating restaurant...');
    const newRestaurant = await Restaurant.create({
      owner: restaurantOwner._id,
      name: restaurant.name.trim(),
      description: restaurant.description?.trim() || `Welcome to ${restaurant.name}!`,
      image: imageUrl, // ✅ Use the uploaded URL
      cuisine: cuisineArray,
      gstNumber: restaurant.gstNumber?.trim() || '',
      deliveryTime: restaurant.deliveryTime?.toString() || '30',
      priceRange: restaurant.priceRange || '₹₹',
      location: {
        area: restaurant.location.area.trim(),
        address: restaurant.location.address.trim(),
        city: restaurant.location.city?.trim() || 'Vadodara',
        state: restaurant.location.state?.trim() || 'Gujarat',
        pincode: (restaurant.location.pincode?.toString() || '390001').trim(),
        coordinates: restaurant.location.coordinates || [0, 0]
      },
      contact: {
        phone: restaurant.contact?.phone?.trim() || phone.trim(),
        email: restaurant.contact?.email?.trim() || email.trim()
      },
      menu: [],  // ✅ ADDED: Initialize empty menu array
      status: 'active',
      isActive: true,
      isNewlyRegistered: true,  // ✅ ADDED: Mark as newly registered
      registeredAt: new Date()   // ✅ ADDED: Registration timestamp
    });
    console.log('✅ Restaurant created:', newRestaurant._id);

    // ✅ Link restaurant to owner
    restaurantOwner.restaurant = newRestaurant._id;
    await restaurantOwner.save();

    console.log('✅ Restaurant linked to owner');

    // ✅✅ CRITICAL: VERIFY the linkage was saved correctly
    console.log('🔍 Verifying restaurant-owner linkage...');
    const verifyOwner = await RestaurantOwner.findById(restaurantOwner._id);
    if (!verifyOwner) {
      console.error('❌ CRITICAL: Cannot find owner after creation!');
      throw new Error('Owner verification failed');
    }

    if (!verifyOwner.restaurant || verifyOwner.restaurant.toString() !== newRestaurant._id.toString()) {
      console.error('❌ CRITICAL: Restaurant linkage verification failed!');
      console.error('Owner restaurant field:', verifyOwner.restaurant);
      console.error('Expected restaurant ID:', newRestaurant._id);
      throw new Error('Failed to link restaurant to owner');
    }
    console.log('✅ Owner linkage verified');

    // ✅✅ CRITICAL: VERIFY we can find the restaurant by owner ID
    console.log('🔍 Verifying restaurant can be found by owner ID...');
    console.log('Searching for owner:', restaurantOwner._id);
    const verifyRestaurant = await Restaurant.findOne({ owner: restaurantOwner._id });
    if (!verifyRestaurant) {
      console.error('❌ CRITICAL: Cannot find restaurant by owner ID immediately after creation!');
      console.error('Owner ID:', restaurantOwner._id);
      console.error('Restaurant ID:', newRestaurant._id);
      console.error('Restaurant owner field:', newRestaurant.owner);
      console.error('Owner ID type:', typeof restaurantOwner._id);
      console.error('Restaurant owner field type:', typeof newRestaurant.owner);

      // Try to find ALL restaurants to debug
      const allRestaurants = await Restaurant.find({});
      console.error('Total restaurants in database:', allRestaurants.length);
      if (allRestaurants.length > 0) {
        console.error('Sample restaurant owners:', allRestaurants.slice(0, 3).map(r => ({ id: r._id, owner: r.owner })));
      }

      throw new Error('Restaurant verification failed - cannot find by owner');
    }
    console.log('✅✅ Verification PASSED - Restaurant can be found by owner ID');
    console.log('Verified restaurant ID:', verifyRestaurant._id);

    // ✅ ✅ ✅ PERMANENT AUTO-SYNC TO CUSTOMER DATABASE ✅ ✅ ✅
    console.log('🔄 ========================================');
    console.log('🔄 STARTING AUTO-SYNC TO CUSTOMER DATABASE');
    console.log('🔄 ========================================');

    const syncStartTime = Date.now();

    try {
      const customerDBPayload = {
        _id: newRestaurant._id.toString(), // ✅ CRITICAL: Include _id for duplicate detection!
        restaurantId: newRestaurant._id.toString(),
        name: newRestaurant.name,
        description: newRestaurant.description,
        image: newRestaurant.image,
        cuisine: cuisineArray,
        gstNumber: newRestaurant.gstNumber || '',
        deliveryTime: newRestaurant.deliveryTime,
        priceRange: newRestaurant.priceRange,
        location: {
          area: newRestaurant.location.area,
          address: newRestaurant.location.address,
          city: newRestaurant.location.city,
          state: newRestaurant.location.state,
          pincode: newRestaurant.location.pincode,
          coordinates: newRestaurant.location.coordinates
        },
        contact: {
          phone: newRestaurant.contact.phone,
          email: newRestaurant.contact.email
        },
        rating: 0,
        totalReviews: 0,
        status: 'active',
        isActive: true, // ✅ ADDED: This was missing!
        isNewlyRegistered: true,
        registeredAt: new Date()
      };

      console.log('📦 Payload prepared:', JSON.stringify(customerDBPayload, null, 2));

      const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'http://localhost:5000';
      const syncUrl = `${CUSTOMER_BACKEND_URL}/api/restaurants/sync`;

      console.log('🌐 Syncing to:', syncUrl);
      console.log('⏱️  Timeout: 15 seconds');

      const syncResponse = await axios.post(
        syncUrl,
        customerDBPayload,
        {
          timeout: 15000, // ✅ INCREASED: from 10s to 15s
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const syncDuration = Date.now() - syncStartTime;
      console.log(`📥 Sync response received in ${syncDuration}ms`);
      console.log('Response data:', syncResponse.data);

      if (syncResponse.data && syncResponse.data.success) {
        console.log('✅ ========================================');
        console.log('✅ SYNC SUCCESSFUL! Restaurant in Customer DB!');
        console.log('✅ ========================================');
        console.log('📍 Customer DB Restaurant ID:', syncResponse.data.data._id);
      } else {
        console.warn('⚠️ ========================================');
        console.warn('⚠️ SYNC RETURNED SUCCESS: FALSE');
        console.warn('⚠️ ========================================');
        console.warn('Message:', syncResponse.data?.message || 'Unknown reason');
      }
    } catch (syncError) {
      const syncDuration = Date.now() - syncStartTime;

      console.error('❌ ========================================');
      console.error('❌ SYNC FAILED AFTER', syncDuration, 'ms');
      console.error('❌ ========================================');
      console.error('Error type:', syncError.name);
      console.error('Error message:', syncError.message);

      if (syncError.code) {
        console.error('Error code:', syncError.code);

        if (syncError.code === 'ECONNREFUSED') {
          console.error('💡 SOLUTION: Customer backend is not running!');
          console.error('💡 Start it with: cd customer-backend && npm start');
        } else if (syncError.code === 'ETIMEDOUT') {
          console.error('💡 SOLUTION: Customer backend is too slow or not responding');
        }
      }

      if (syncError.response) {
        console.error('Response status:', syncError.response.status);
        console.error('Response data:', syncError.response.data);
      }

      if (syncError.response && syncError.response.data?.message) {
        return res.status(400).json({
          success: false,
          message: "Customer DB sync failed: " + syncError.response.data.message
        });
      }

      console.warn('⚠️ Registration completed but sync failed');
      console.warn('⚠️ Restaurant needs manual sync to Customer DB');
    }

    // ✅ Generate token
    const token = restaurantOwner.getJwtToken();

    // ✅ Success response
    res.status(201).json({
      success: true,
      token,
      data: {
        user: {
          id: restaurantOwner._id,
          name: restaurantOwner.name,
          email: restaurantOwner.email,
          phone: restaurantOwner.phone
        },
        restaurant: {
          id: newRestaurant._id,
          name: newRestaurant.name,
          location: newRestaurant.location,
          status: newRestaurant.status
        }
      },
      message: 'Registration successful! Welcome to QuickBite.'
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
        error: error.message
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `This ${field} is already registered`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// POST /api/auth/login
export const loginRestaurantOwner = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const restaurantOwner = await RestaurantOwner.findOne({ email }).select('+password');
    console.log('Login attempt for email:', email, 'User found:', !!restaurantOwner);

    if (!restaurantOwner || !(await restaurantOwner.comparePassword(password))) {
      console.log('Invalid credentials for:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = restaurantOwner.getJwtToken();

    const user = {
      id: restaurantOwner._id,
      name: restaurantOwner.name,
      email: restaurantOwner.email,
      phone: restaurantOwner.phone,
      isApproved: restaurantOwner.isApproved || false  // ✅ NEW: Include approval status
    };

    console.log('Login successful for:', email);

    res.json({
      success: true,
      data: { token, user },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('loginRestaurantOwner error:', error);
    res.status(500).json({ success: false, message: 'Failed to login restaurant owner' });
  }
};

// GET /api/auth/me
export const getCurrentRestaurantOwner = async (req, res) => {
  try {
    const restaurantOwner = await RestaurantOwner.findById(req.restaurantOwner.id).select('-password');
    if (!restaurantOwner) {
      return res.status(401).json({ success: false, message: 'Restaurant owner not found' });
    }

    const user = {
      id: restaurantOwner._id,
      name: restaurantOwner.name,
      email: restaurantOwner.email,
      phone: restaurantOwner.phone,
      role: restaurantOwner.role,
      isActive: restaurantOwner.isActive,
      isApproved: restaurantOwner.isApproved || false  // ✅ NEW: Include approval status
    };

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('getCurrentRestaurantOwner error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurant owner profile' });
  }
};

// PUT /api/auth/profile
export const updateRestaurantOwnerProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    if (phone !== undefined && phone !== req.restaurantOwner.phone) {
      const existingPhone = await RestaurantOwner.findOne({ phone });
      if (existingPhone && existingPhone._id.toString() !== req.restaurantOwner.id.toString()) {
        return res.status(400).json({ success: false, message: 'Phone number already in use' });
      }
    }

    const restaurantOwner = await RestaurantOwner.findByIdAndUpdate(
      req.restaurantOwner.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!restaurantOwner) {
      return res.status(404).json({ success: false, message: 'Restaurant owner not found' });
    }

    res.json({
      success: true,
      data: {
        id: restaurantOwner._id,
        name: restaurantOwner.name,
        email: restaurantOwner.email,
        phone: restaurantOwner.phone
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('updateRestaurantOwnerProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// PUT /api/auth/password
export const updateRestaurantOwnerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const restaurantOwner = await RestaurantOwner.findById(req.restaurantOwner.id).select('+password');

    if (!restaurantOwner || !(await restaurantOwner.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    restaurantOwner.password = newPassword;
    await restaurantOwner.save();

    const token = restaurantOwner.getJwtToken();

    res.json({
      success: true,
      data: { token },
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('updateRestaurantOwnerPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};
