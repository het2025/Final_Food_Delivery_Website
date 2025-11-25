import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },  // Fixed
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantOwner' },  // Legacy
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    isVeg: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0 },
    tags: [String]
  },
  {
    timestamps: true,
    collection: 'menu_items'
  }
);

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
