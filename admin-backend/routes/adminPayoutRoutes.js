import express from 'express';
import { getPendingBankAccounts, updateBankAccountStatus } from '../controllers/adminBankAccountController.js';
// import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming auth middleware exists

const router = express.Router();

// router.use(protect); // specific protection if needed
// router.use(admin);

router.get('/bank-accounts/pending', getPendingBankAccounts);
router.put('/bank-accounts/:id/status', updateBankAccountStatus);

export default router;
