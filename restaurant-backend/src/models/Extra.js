import mongoose from 'mongoose';

const extraSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },  // e.g., "Extra Sauce"
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'extras' }
);

export const Extra = mongoose.model('Extra', extraSchema);
