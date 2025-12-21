import mongoose from 'mongoose';

// RestaurantOwner schema for admin backend (to populate restaurant owner details)
const RestaurantOwnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const RestaurantOwner = mongoose.model('RestaurantOwner', RestaurantOwnerSchema, 'restaurantowners');
