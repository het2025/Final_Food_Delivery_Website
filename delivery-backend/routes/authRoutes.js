import express from 'express';
import {
  registerDelivery,
  loginDelivery,
  getCurrentDelivery,
  logoutDelivery
} from '../controllers/deliveryAuthController.js';
import { authDelivery } from '../middleware/deliveryAuth.js';

const router = express.Router();

router.post('/register', registerDelivery);
router.post('/login', loginDelivery);
router.get('/me', authDelivery, getCurrentDelivery);
router.post('/logout', authDelivery, logoutDelivery);

export default router;
