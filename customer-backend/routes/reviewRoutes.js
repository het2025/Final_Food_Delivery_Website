import express from 'express';
import {
    addReview,
    getRestaurantReviews,
    getUserReviews,
    deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addReview);

router.route('/restaurant/:restaurantId')
    .get(getRestaurantReviews);

router.route('/myreviews')
    .get(protect, getUserReviews);

router.route('/:id')
    .delete(protect, deleteReview);

export default router;
