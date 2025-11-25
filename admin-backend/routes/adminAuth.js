import express from 'express';
import { loginAdmin, getCurrentAdmin, updatePassword } from '../controllers/adminAuthController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/me', authAdmin, getCurrentAdmin);
router.put('/password', authAdmin, updatePassword);

export default router;
