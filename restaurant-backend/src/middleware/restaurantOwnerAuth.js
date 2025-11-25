import jwt from 'jsonwebtoken';
import { RestaurantOwner } from '../models/RestaurantOwner.js';  // Model for auth (assumes exists with _id, password)

export const authRestaurantOwner = async (req, res, next) => {  // Renamed/exported correctly
  try {
    const authHeader = req.headers.authorization || '';  // Fixed: Lowercase 'authorization' standard
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]  // Fixed: Split correctly to get token
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify with secret

    const restaurantOwner = await RestaurantOwner.findById(decoded.id).select('-password');  // Exclude password
    if (!restaurantOwner) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, restaurant owner not found'
      });
    }

    req.restaurantOwner = { 
      id: restaurantOwner._id,  // Attach ID (add more: email, role if needed)
      // Optional: req.restaurantOwner = restaurantOwner; for full user object
    };
    next();
  } catch (error) {
    console.error('authRestaurantOwner error:', error);  // Log for debugging
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    });
  }
};
