import { RestaurantOwner } from '../models/RestaurantOwner.js';

/**
 * Middleware to check if restaurant owner is approved
 * Blocks access to protected routes until admin approval
 */
export const checkApproval = async (req, res, next) => {
    try {
        // Fetch the restaurant owner to get latest approval status
        const owner = await RestaurantOwner.findById(req.restaurantOwner.id).select('isApproved name email');

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant owner not found'
            });
        }

        // Check if approved
        if (!owner.isApproved) {
            return res.status(403).json({
                success: false,
                message: 'Your restaurant is pending approval from QuickBite. You will be notified once approved.',
                code: 'PENDING_APPROVAL'
            });
        }

        // Owner is approved, continue
        next();
    } catch (error) {
        console.error('Check approval middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking approval status'
        });
    }
};
