import { DeliveryBoy } from '../models/DeliveryBoy.js';

// @desc    Update profile
// @route   PUT /api/delivery/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber } = req.body;

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    if (name) deliveryBoy.name = name;
    if (phone) deliveryBoy.phone = phone;
    if (vehicleType) deliveryBoy.vehicleType = vehicleType;
    if (vehicleNumber) deliveryBoy.vehicleNumber = vehicleNumber;

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Toggle online status
// @route   PUT /api/delivery/profile/online
// @access  Private
export const toggleOnlineStatus = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
    deliveryBoy.isOnline = !deliveryBoy.isOnline;
    
    if (!deliveryBoy.isOnline) {
      deliveryBoy.isAvailable = false;
    }

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: `You are now ${deliveryBoy.isOnline ? 'online' : 'offline'}`,
      data: {
        isOnline: deliveryBoy.isOnline,
        isAvailable: deliveryBoy.isAvailable
      }
    });
  } catch (error) {
    console.error('Toggle online error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling online status'
    });
  }
};

// @desc    Toggle availability
// @route   PUT /api/delivery/profile/availability
// @access  Private
export const toggleAvailability = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    if (!deliveryBoy.isOnline) {
      return res.status(400).json({
        success: false,
        message: 'You must be online to change availability'
      });
    }

    if (deliveryBoy.currentOrder) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change availability while on active delivery'
      });
    }

    deliveryBoy.isAvailable = !deliveryBoy.isAvailable;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: `You are now ${deliveryBoy.isAvailable ? 'available' : 'unavailable'} for orders`,
      data: {
        isAvailable: deliveryBoy.isAvailable
      }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling availability'
    });
  }
};

// @desc    Get earnings summary
// @route   GET /api/delivery/profile/earnings
// @access  Private
export const getEarnings = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: deliveryBoy.totalEarnings,
        completedOrders: deliveryBoy.completedOrders,
        averageEarningsPerOrder: deliveryBoy.completedOrders > 0 
          ? (deliveryBoy.totalEarnings / deliveryBoy.completedOrders).toFixed(2)
          : 0,
        rating: deliveryBoy.rating
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings'
    });
  }
};
