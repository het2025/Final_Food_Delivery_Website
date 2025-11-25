import mongoose from 'mongoose';

const deliveryOrderSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  orderNumber: String,
  deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy',
    default: null
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  restaurantName: String,
  restaurantLocation: {
    address: String,
    coordinates: [Number]
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: String,
  customerPhone: String,
  deliveryAddress: {
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: [Number]
  },
  orderAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: [
      'ready_for_pickup',
      'assigned',
      'accepted',
      'rejected',
      'picked_up',
      'in_transit',
      'delivered',
      'cancelled'
    ],
    default: 'ready_for_pickup'
  },
  assignedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  estimatedDeliveryTime: Number, // in minutes
  actualDeliveryTime: Number,
  distance: Number, // in km
  rejectionReason: String,
  deliveryOTP: {
    type: String,
    default: null
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    default: 'online'
  }
}, {
  timestamps: true
});

export const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);
