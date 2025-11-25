import { DeliveryBoy } from '../models/DeliveryBoy.js';

// @desc    Register delivery boy
// @route   POST /api/delivery/auth/register
// @access  Public
export const registerDelivery = async (req, res) => {
  try {
    const { name, email, phone, password, vehicleType, vehicleNumber, drivingLicense } = req.body;

    // Check if delivery boy already exists
    const existingDelivery = await DeliveryBoy.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already registered'
      });
    }

    // Create delivery boy
    const deliveryBoy = await DeliveryBoy.create({
      name,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      drivingLicense
    });

    const token = deliveryBoy.getJwtToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          vehicleType: deliveryBoy.vehicleType,
          isVerified: deliveryBoy.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Register delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login delivery boy
// @route   POST /api/delivery/auth/login
// @access  Public
export const loginDelivery = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await deliveryBoy.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update online status
    deliveryBoy.isOnline = true;
    await deliveryBoy.save();

    const token = deliveryBoy.getJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          vehicleType: deliveryBoy.vehicleType,
          isOnline: deliveryBoy.isOnline,
          isAvailable: deliveryBoy.isAvailable,
          completedOrders: deliveryBoy.completedOrders,
          totalEarnings: deliveryBoy.totalEarnings,
          rating: deliveryBoy.rating
        }
      }
    });
  } catch (error) {
    console.error('Login delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// @desc    Get current delivery boy profile
// @route   GET /api/delivery/auth/me
// @access  Private
export const getCurrentDelivery = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id)
      .populate('currentOrder')
      .select('-password');

    res.status(200).json({
      success: true,
      data: deliveryBoy
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// @desc    Logout delivery boy
// @route   POST /api/delivery/auth/logout
// @access  Private
export const logoutDelivery = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
    deliveryBoy.isOnline = false;
    deliveryBoy.isAvailable = false;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};
