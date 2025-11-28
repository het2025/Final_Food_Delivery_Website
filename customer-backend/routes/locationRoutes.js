import express from 'express';
import * as locationController from '../controllers/locationController.js';

const router = express.Router();

// Search address
router.get('/search', locationController.searchAddress);

// Get coordinates
router.get('/geocode', locationController.getCoordinates);

// Reverse geocode
router.get('/reverse-geocode', locationController.reverseGeocode);

// Calculate distance
router.get('/distance', locationController.calculateDistance);

export default router;
