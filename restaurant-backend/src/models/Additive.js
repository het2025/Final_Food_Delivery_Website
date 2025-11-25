import mongoose from 'mongoose';

const additiveSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },  // e.g., "Extra Cheese"
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'additives' }
);

export const Additive = mongoose.model('Additive', additiveSchema);
