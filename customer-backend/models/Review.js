import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'Restaurant is required']
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    photos: [{
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid photo URL'
        }
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    reply: {
        comment: { type: String, trim: true },
        repliedAt: { type: Date },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Restaurant owner/manager
    }
}, {
    timestamps: true
});

// Prevent multiple reviews for the same order (if order is present)
reviewSchema.index({ order: 1 }, { unique: true, partialFilterExpression: { order: { $exists: true, $ne: null } } });

// Compound index for fetching restaurant reviews efficiently
reviewSchema.index({ restaurant: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (restaurantId) {
    const stats = await this.aggregate([
        {
            $match: { restaurant: restaurantId }
        },
        {
            $group: {
                _id: '$restaurant',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
            rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
            totalReviews: stats[0].nRating
        });
    } else {
        await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
            rating: 0,
            totalReviews: 0
        });
    }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.restaurant);
});

// Call calcAverageRatings before remove/delete
// Note: In Mongoose 5.x/6.x middleware for deleteOne/findOneAndDelete might differ.
// Using post 'findOneAndDelete' and 'deleteOne' query middleware if possible, or document middleware.
// For simplicity and robustness with modern mongoose, we'll use post query middleware for findOneAndDelete/findOneAndRemove
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.restaurant);
    }
});

export default mongoose.model('Review', reviewSchema);
