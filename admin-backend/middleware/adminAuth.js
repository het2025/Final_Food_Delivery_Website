import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const authAdmin = async (req, res, next) => {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
    
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, admin not found'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('authAdmin error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    });
  }
};
