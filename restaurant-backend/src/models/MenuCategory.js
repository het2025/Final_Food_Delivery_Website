import mongoose from 'mongoose';

const menuCategorySchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },  // Fixed: 'restaurant'
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantOwner' },  // Legacy
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'menu_categories'
  }
);

export const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);
