import express from 'express'
import {
  getRestaurantOwnerExtras,
  createRestaurantOwnerExtra,
  updateRestaurantOwnerExtra,
  deleteRestaurantOwnerExtra
} from '../controllers/restaurantOwnerExtraController.js'  // Updated controller filename assumption
import { authRestaurantOwner } from '../middleware/restaurantOwnerAuth.js'  // Updated middleware filename assumption

const router = express.Router()

router.use(authRestaurantOwner)

router.get('/', getRestaurantOwnerExtras)
router.post('/', createRestaurantOwnerExtra)
router.put('/:id', updateRestaurantOwnerExtra)
router.delete('/:id', deleteRestaurantOwnerExtra)

export default router
