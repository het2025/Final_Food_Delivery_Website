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
    deliveryAddress: { type: String },
    notes: { type: String },
    
    // ✅ NEW: Customer information
    customerName: { type: String },
    customerPhone: { type: String }
  },
  { timestamps: true, collection: 'orders' }
);

export const Order = mongoose.model('Order', orderSchema);
