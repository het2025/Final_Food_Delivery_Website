import { Restaurant } from '../models/Restaurant.js';
import { RestaurantOwner } from '../models/RestaurantOwner.js';

// ✅ GET PROFILE: Restaurant details for Profile Settings page
export const getRestaurantProfile = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    
    const restaurant = await Restaurant.findOne({ owner: restaurantOwnerId });
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant profile not found'
      });
    }

    res.json({ 
      success: true, 
      data: restaurant 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load profile' 
    });
  }
};

// ✅ UPDATE PROFILE: Update restaurant details from Profile Settings
export const updateRestaurantProfile = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { 
      name, 
      description, 
      image, 
      cuisine,
      gstNumber,
      deliveryTime, 
      priceRange, 
      location, 
      contact 
    } = req.body;

    if (!name || !location?.area || !location?.address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, area, and address are required' 
      });
    }

    const updatedData = {
      name: name.trim(),
      description: description?.trim() || '',
      image: image || '',
      cuisine: cuisine || [],
      gstNumber: gstNumber?.trim() || '',
      deliveryTime: deliveryTime || '30',
      priceRange: priceRange || '₹₹',
      location: {
        area: location.area.trim(),
        address: location.address.trim(),
        city: location.city?.trim() || '',
        state: location.state?.trim() || 'Gujarat',
        pincode: location.pincode?.toString() || '',
        coordinates: location.coordinates || [0, 0]
      },
      contact: {
        phone: contact?.phone || '',
        email: contact?.email || ''
      }
    };

    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: restaurantOwnerId },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Restaurant not found' 
      });
    }

    res.json({ 
      success: true, 
      data: restaurant,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update profile' 
    });
  }
};

// ✅ UPDATE OWNER INFO: Name, email, phone (optional)
export const updateOwnerInfo = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { name, phone } = req.body;

    const owner = await RestaurantOwner.findByIdAndUpdate(
      restaurantOwnerId,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      success: true, 
      data: owner,
      message: 'Owner info updated successfully' 
    });
  } catch (error) {
    console.error('Update owner info error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update owner info' 
    });
  }
};
