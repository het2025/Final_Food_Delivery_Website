const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.addresses || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses'
    });
  }
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res) => {
  try {
    const { type, street, city, state, pincode, landmark, isDefault } = req.body;

    // Validation
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      type: type || 'home',
      street,
      city,
      state,
      pincode,
      landmark: landmark || '',
      isDefault: isDefault || false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding address'
    });
  }
});

// @desc    Update address
// @route   PUT /api/addresses/:addressId
// @access  Private
exports.updateAddress = asyncHandler(async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, street, city, state, pincode, landmark, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, unset others
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address fields
    if (type) address.type = type;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (landmark !== undefined) address.landmark = landmark;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating address'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/addresses/:addressId
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.addresses.pull(addressId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting address'
    });
  }
});
