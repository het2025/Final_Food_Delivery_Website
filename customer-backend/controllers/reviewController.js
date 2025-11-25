const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { restaurantId, orderId, rating, comment, photos } = req.body;

        // Check if restaurant exists
        const restaurant = await Restaurant.findOne({ restaurantId: restaurantId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Optional: Check if user has already reviewed this order
        if (orderId) {
            const existingReview = await Review.findOne({ order: orderId });
            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this order' });
            }

            // Verify order belongs to user and restaurant
            const order = await Order.findOne({
                _id: orderId,
                customer: req.user._id,
                // We might need to match restaurant ObjectId or restaurantId string depending on Order schema
                // Based on Order schema, 'restaurant' is ObjectId ref.
                // But we received restaurantId (string) in body. 
                // We should probably rely on the restaurant object we found above.
                restaurant: restaurant._id
            });

            if (!order) {
                // If order verification fails, we might still allow review if it's a general review? 
                // For now, if orderId is provided, it MUST be valid.
                return res.status(400).json({ message: 'Invalid order for this review' });
            }
        }

        const review = await Review.create({
            user: req.user._id,
            restaurant: restaurant._id,
            order: orderId || null,
            rating,
            comment,
            photos,
            isVerifiedPurchase: !!orderId
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const restaurantId = req.params.restaurantId;

        // Find restaurant by custom ID first to get ObjectId
        const restaurant = await Restaurant.findOne({ restaurantId: restaurantId });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const count = await Review.countDocuments({ restaurant: restaurant._id });

        const reviews = await Review.find({ restaurant: restaurant._id })
            .populate('user', 'name profileImage') // Assuming User model has name and profileImage
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            reviews,
            page,
            pages: Math.ceil(count / pageSize),
            totalReviews: count,
            averageRating: restaurant.rating
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/myreviews
// @access  Private
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('restaurant', 'name image')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review (or is admin - logic omitted for simplicity)
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this review' });
        }

        await review.deleteOne(); // This triggers the post remove hook in model

        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
