import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser
} from '../controllers/adminUserController.js';
import { authAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', authAdmin, getAllUsers);
router.get('/:id', authAdmin, getUserById);
router.put('/:id/status', authAdmin, updateUserStatus);
router.delete('/:id', authAdmin, deleteUser);

export default router;
