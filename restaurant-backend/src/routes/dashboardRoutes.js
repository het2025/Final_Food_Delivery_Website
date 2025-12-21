import express from 'express'
import {
    getRestaurantOwnerDashboardStats,
    getPayoutStats,  // ✅ NEW
    collectPayout,   // ✅ NEW
    getPayoutHistory // ✅ NEW
} from '../controllers/restaurantOwnerDashboardController.js'
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js'  // Updated middleware filename assumption

const router = express.Router()

router.use(authRestaurantOwner)

router.get('/stats', getRestaurantOwnerDashboardStats)
router.get('/payouts-stats', getPayoutStats) // ✅ NEW
router.post('/collect-payout', collectPayout) // ✅ NEW
router.get('/payout-history', getPayoutHistory) // ✅ NEW

export default router
