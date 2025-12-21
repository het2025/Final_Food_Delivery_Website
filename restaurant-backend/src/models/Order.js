import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Customer
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi'],
      default: 'online'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'pending'
    },
    // ✅ CHANGED: Store full address object for delivery backend
    deliveryAddress: { type: Object },
    deliveryFee: { type: Number, default: 0 },
    deliveryDistance: { type: Number, default: 0 },

    // ✅ NEW: Explicit price breakdown for restaurant display
    subtotal: { type: Number, default: 0 }, // Dish Price
    taxes: { type: Number, default: 0 },    // Taxes

    notes: { type: String },

    // ✅ NEW: Customer information
    customerName: { type: String },
    customerPhone: { type: String },

    // ✅ NEW: Store original order ID from customer-backend
    originalOrderId: { type: String }
  },
  { timestamps: true, collection: 'orders' }
);

export const Order = mongoose.model('Order', orderSchema);
