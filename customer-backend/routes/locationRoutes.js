const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Search address
router.get('/search', locationController.searchAddress);

// Get coordinates
router.get('/geocode', locationController.getCoordinates);

// Reverse geocode
router.get('/reverse-geocode', locationController.reverseGeocode);

// Calculate distance
router.get('/distance', locationController.calculateDistance);

module.exports = router;
