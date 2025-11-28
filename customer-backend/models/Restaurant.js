import mongoose from 'mongoose';

// Menu Item Schema
const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: {
      type: String
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  isVeg: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dishType: {
    type: String,
    enum: ['starter', 'main', 'dessert', 'beverage', 'snack', 'combo'],
    default: 'main'
  }
}, { _id: false });

MenuItemSchema.pre('save', function (next) {
  if (this.name) {
    this.lowercase = this.name.toLowerCase();
  }
  next();
});

// Menu Category Schema
const MenuCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: {
      type: String
    }
  },
  items: [MenuItemSchema],
  description: {
    type: String,
    trim: true
  }
}, { _id: false });

MenuCategorySchema.pre('save', function (next) {
  if (this.category) {
    this.lowercase = this.category.toLowerCase();
  }
  next();
});

// ✅ FIXED: Main Restaurant Schema - Made validation flexible for sync
const RestaurantSchema = new mongoose.Schema({
  // Required and unique for sync
  restaurantId: {
    type: String,
    required: [true, 'Restaurant ID is required'],
    unique: true,
    index: true
  },

  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  ownerName: {
    type: String,
    default: '',
    trim: true
  },

  description: {
    type: String,
    trim: true,
    default: 'Welcome to our restaurant!',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  image: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  },

  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },

  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },

  // ✅ FIXED: Made optional with default
  deliveryTime: {
    type: String,
    default: '30'
  },

  // ✅ FIXED: Location - made all fields optional with defaults
  location: {
    area: {
      type: String,
      trim: true,
      default: 'City Center'
    },
    address: {
      type: String,
      trim: true,
      default: 'Main Road'
    },
    city: {
      type: String,
      trim: true,
      default: 'Vadodara'
    },
    state: {
      type: String,
      trim: true,
      default: 'Gujarat'
    },
    pincode: {
      type: String,
      trim: true,
      default: '390001'
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      validate: {
        validator: function (v) {
          return !v || v.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },

  contact: {
    phone: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          return !v || /^[\+]?[0-9\-\s\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    email: {
      type: String,
      lowercase: true,
      default: '',
      validate: {
        validator: function (v) {
          return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Invalid email format'
      }
    }
  },

  cuisine: [{
    type: String,
    trim: true
  }],

  gstNumber: {
    type: String,
    default: '',
    trim: true
  },

  priceRange: {
    type: String,
    trim: true,
    default: '₹₹'
  },

  features: [{
    type: String,
    trim: true
  }],

  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },

  menu: [MenuCategorySchema],

  // Search-optimized fields
  searchableText: {
    type: String,
    select: false
  },
  dishNames: [{
    type: String,
    select: false
  }],
  categoryNames: [{
    type: String,
    select: false
  }],

  // Backend management
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // ✅ Newly registered tracking
  isNewlyRegistered: {
    type: Boolean,
    default: true,
    index: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
RestaurantSchema.index({ name: 'text', description: 'text', cuisine: 'text' });
RestaurantSchema.index({ 'location.area': 1 });
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ rating: -1 });
RestaurantSchema.index({ status: 1, isActive: 1 });
RestaurantSchema.index({ 'location.coordinates': '2dsphere' });
RestaurantSchema.index({ 'menu.items.name': 'text' });
RestaurantSchema.index({ 'menu.category': 1 });
RestaurantSchema.index({ 'menu.items.tags': 1 });
RestaurantSchema.index({ dishNames: 1 });
RestaurantSchema.index({ categoryNames: 1 });
RestaurantSchema.index({ restaurantId: 1 }, { unique: true });
RestaurantSchema.index({ isNewlyRegistered: 1, createdAt: -1 });

// Compound indexes
RestaurantSchema.index({
  status: 1,
  isActive: 1,
  'menu.items.name': 'text',
  rating: -1
});

RestaurantSchema.index({
  'location.area': 1,
  cuisine: 1,
  rating: -1
});

// Pre-save middleware
RestaurantSchema.pre('save', function (next) {
  // Update searchableText
  const searchParts = [
    this.name,
    this.description,
    (Array.isArray(this.cuisine) ? this.cuisine.join(' ') : ''),
    this.location && this.location.area ? this.location.area : '',
    (Array.isArray(this.features) ? this.features.join(' ') : '')
  ];

  if (this.menu && this.menu.length > 0) {
    this.menu.forEach(category => {
      searchParts.push(category.category);
      if (category.items && category.items.length > 0) {
        category.items.forEach(item => {
          searchParts.push(item.name);
          if (item.description) searchParts.push(item.description);
          if (item.tags && item.tags.length > 0) {
            searchParts.push(item.tags.join(' '));
          }
        });
      }
    });
  }

  this.searchableText = searchParts.filter(Boolean).join(' ').toLowerCase();

  // Update dish names and category names
  this.dishNames = [];
  this.categoryNames = [];

  if (this.menu && this.menu.length > 0) {
    this.menu.forEach(category => {
      if (category.category) this.categoryNames.push(category.category.toLowerCase());
      if (category.items && category.items.length > 0) {
        category.items.forEach(item => {
          if (item.name) this.dishNames.push(item.name.toLowerCase());
        });
      }
    });
  }

  next();
});

// Virtuals
RestaurantSchema.virtual('fullAddress').get(function () {
  return `${this.location.address}, ${this.location.area}`;
});

RestaurantSchema.virtual('popularItems').get(function () {
  const popularItems = [];
  if (this.menu && this.menu.length > 0) {
    this.menu.forEach(category => {
      if (category.items && category.items.length > 0) {
        category.items.forEach(item => {
          if (item.isPopular) {
            const itemObj = (item.toObject && typeof item.toObject === 'function') ? item.toObject() : item;
            popularItems.push(Object.assign({}, itemObj, { category: category.category }));
          }
        });
      }
    });
  }
  return popularItems;
});

// Static methods
RestaurantSchema.statics.searchByDish = function (dishName, options = {}) {
  const { limit = 20, area, cuisine, minRating } = options;

  let query = {
    status: 'active',
    isActive: true,
    $or: [
      { dishNames: { $regex: dishName, $options: 'i' } },
      { 'menu.items.name': { $regex: dishName, $options: 'i' } },
      { categoryNames: { $regex: dishName, $options: 'i' } }
    ]
  };

  if (area) query['location.area'] = { $regex: area, $options: 'i' };
  if (cuisine) query.cuisine = { $elemMatch: { $regex: cuisine, $options: 'i' } };
  if (minRating) query.rating = { $gte: minRating };

  return this.find(query)
    .select('-searchableText -dishNames -categoryNames -__v')
    .sort({ rating: -1, totalReviews: -1 })
    .limit(limit)
    .lean();
};

RestaurantSchema.statics.fuzzySearch = function (searchTerm, options = {}) {
  const { limit = 20 } = options;

  const patterns = [
    searchTerm,
    searchTerm.replace(/s$/, ''),
    (searchTerm.split(' ')[0] || ''),
    searchTerm.toLowerCase()
  ];

  const orConditions = [];

  patterns.forEach(pattern => {
    if (!pattern) return;
    orConditions.push(
      { name: { $regex: pattern, $options: 'i' } },
      { dishNames: { $regex: pattern, $options: 'i' } },
      { categoryNames: { $regex: pattern, $options: 'i' } },
      { cuisine: { $elemMatch: { $regex: pattern, $options: 'i' } } },
      { 'menu.items.name': { $regex: pattern, $options: 'i' } }
    );
  });

  return this.find({
    status: 'active',
    isActive: true,
    $or: orConditions
  })
    .select('-searchableText -dishNames -categoryNames -__v')
    .sort({ rating: -1, totalReviews: -1 })
    .limit(limit)
    .lean();
};

RestaurantSchema.methods.getDishesByCategory = function (categoryName) {
  const matchingCategories = (this.menu || []).filter(category =>
    category.category && category.category.toLowerCase().includes(categoryName.toLowerCase())
  );

  return matchingCategories.flatMap(category =>
    (category.items || []).map(item => Object.assign(
      (item.toObject && typeof item.toObject === 'function') ? item.toObject() : item,
      { category: category.category }
    ))
  );
};

export default mongoose.model('Restaurant', RestaurantSchema);
