import express from 'express';
import * as geocodeController from '../controllers/geocodeController.js';

const router = express.Router();

router.get('/reverse', geocodeController.reverseGeocode);
router.get('/search', geocodeController.searchAddress);

export default router;
