import jwt from 'jsonwebtoken';
import { DeliveryBoy } from '../models/DeliveryBoy.js';

export const authDelivery = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'delivery-secret');
    
    const deliveryBoy = await DeliveryBoy.findById(decoded.id).select('-password');
    
    if (!deliveryBoy) {
      return res.status(401).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    if (!deliveryBoy.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    req.deliveryBoy = deliveryBoy;
    next();
  } catch (error) {
    console.error('Auth delivery error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    });
  }
};
