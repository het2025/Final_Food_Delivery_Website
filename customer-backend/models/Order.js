const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order identification - Changed to orderNumber to match index
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function () {
      const crypto = require('crypto');
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = crypto.randomBytes(3).toString('hex').toUpperCase();
      return `ORD-${date}-${random}`;
    }
  },

  // Also keep orderId for compatibility
  orderId: {
    type: String,
    default: function () {
      return this.orderNumber;
    }
  },

  // Customer reference
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },

  // Order items (menuItem is optional)
  items: [{
    menuItem: {
      type: String,
      default: null
    },
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    price: {
      type: Number,
      required: [true, 'Item price is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: 1
    },
    image: {
      type: String,
      default: '/placeholder.jpg'
    },
    customization: String
  }],

  // Restaurant info
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  },
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required']
  },
  restaurantImage: {
    type: String,
    default: '/placeholder.jpg'
  },

  // Delivery address
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String,
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    }
  },

  // Order pricing
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  taxes: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['COD', 'online', 'wallet'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },

  // Order status
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Confirmed', 'Preparing', 'Out for Delivery', 'Cancelled'],
    default: 'Pending'
  },

  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,

  // Delivery info
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryDistance: Number,
  deliveryDuration: Number,

  // Timestamps
  orderTime: {
    type: Date,
    default: Date.now
  },

  // Additional
  instructions: String,
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: String,

  // Rating & Review
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewDate: Date

}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
