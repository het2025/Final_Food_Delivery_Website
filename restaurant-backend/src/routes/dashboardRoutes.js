import express from 'express'
import { getRestaurantOwnerDashboardStats } from '../controllers/restaurantOwnerDashboardController.js'  // Updated controller filename assumption
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js'  // Updated middleware filename assumption

const router = express.Router()

router.use(authRestaurantOwner)

router.get('/stats', getRestaurantOwnerDashboardStats)

export default router
