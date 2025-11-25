const express = require('express');
const router = express.Router();
const {
    addReview,
    getRestaurantReviews,
    getUserReviews,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware'); // Assuming authMiddleware exists

router.route('/')
    .post(protect, addReview);

router.route('/restaurant/:restaurantId')
    .get(getRestaurantReviews);

router.route('/myreviews')
    .get(protect, getUserReviews);

router.route('/:id')
    .delete(protect, deleteReview);

module.exports = router;
