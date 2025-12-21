import mongoose from 'mongoose';

// Minimal Restaurant schema for admin backend (to populate bank account requests)
const RestaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RestaurantOwner'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        phone: String,
        email: String
    },
    location: {
        area: String,
        address: String,
        city: String
    },
    cuisine: [String],
    gstNumber: String
}, { timestamps: true });

// Use both collection names (new_registered_restaurants and restaurants)
export const Restaurant = mongoose.model('Restaurant', RestaurantSchema, 'new_registered_restaurants');
