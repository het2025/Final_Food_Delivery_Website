import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  url: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  preparationTime: {
    type: Number,
    default: 15
  }
}, { timestamps: true, _id: true });

// ✅ NEW: Menu category schema (groups items by category)
const MenuCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  items: [MenuItemSchema]
}, { _id: false });

const RestaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantOwner',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  cuisine: [{
    type: String,
    trim: true
  }],
  gstNumber: {
    type: String,
    trim: true
  },
  deliveryTime: {
    type: String,
    default: '30'
  },
  priceRange: {
    type: String,
    default: '₹₹'
  },
  location: {
    area: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      default: 'Vadodara'
    },
    state: {
      type: String,
      default: 'Gujarat'
    },
    pincode: {
      type: String,
      default: '390001'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  contact: {
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    }
  },
  
  // ✅ Menu items stored here
  menu: [MenuCategorySchema],
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema, 'new_registered_restaurants');
