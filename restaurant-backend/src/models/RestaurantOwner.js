import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const restaurantOwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      // ✅ FIX: Remove strict 10-digit validation to allow country codes
      validate: {
        validator: function (v) {
          // Allow 10-13 digits with optional + and spaces
          return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(v.replace(/\s/g, ''));
        },
        message: 'Please enter a valid phone number'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      default: 'restaurantOwner',
      enum: ['restaurantOwner', 'admin']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Approval workflow fields
    isApproved: {
      type: Boolean,
      default: false,
      index: true
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    rejectedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  },
  {
    timestamps: true,
    collection: 'restaurantowners'
  }
);

// Hash password before saving
restaurantOwnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
restaurantOwnerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
restaurantOwnerSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const RestaurantOwner = mongoose.model('RestaurantOwner', restaurantOwnerSchema);
