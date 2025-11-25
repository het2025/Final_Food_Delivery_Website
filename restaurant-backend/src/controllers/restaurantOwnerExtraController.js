import { Extra } from '../models/Extra.js'
import { Restaurant } from '../models/Restaurant.js'

const getRestaurantOwnerRestaurantId = async (restaurantOwnerId) => {
  const restaurant = await Restaurant.findOne({ owner: restaurantOwnerId }).select('_id')  // ✅ FIXED
  return restaurant ? restaurant._id : null
}

export const getRestaurantOwnerExtras = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id
    const restaurantId = await getRestaurantOwnerRestaurantId(restaurantOwnerId)
    
    if (!restaurantId) {
      return res.json({
        success: true,
        data: [],
        message: 'No restaurant linked. Create your store first.'
      })
    }

    const extras = await Extra.find({ restaurant: restaurantId }).sort({ createdAt: -1 })  // ✅ FIXED

    return res.json({ success: true, data: extras })
  } catch (error) {
    console.error('getRestaurantOwnerExtras error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch extras' })
  }
}

export const createRestaurantOwnerExtra = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id
    const { name, category, price, description, isAvailable } = req.body

    if (!name || !category || price == null) {
      return res.status(400).json({ success: false, message: 'name, category, and price are required' })
    }

    const restaurantId = await getRestaurantOwnerRestaurantId(restaurantOwnerId)
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'No restaurant linked' })
    }

    const extra = await Extra.create({
      restaurant: restaurantId,  // ✅ FIXED
      name,
      category,
      price: Number(price),
      description: description || '',
      isAvailable: isAvailable !== false
    })

    return res.status(201).json({ success: true, data: extra })
  } catch (error) {
    console.error('createRestaurantOwnerExtra error:', error)
    return res.status(500).json({ success: false, message: error.message || 'Failed to create extra' })
  }
}

export const updateRestaurantOwnerExtra = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id
    const { id } = req.params
    const { name, category, price, description, isAvailable } = req.body

    const restaurantId = await getRestaurantOwnerRestaurantId(restaurantOwnerId)
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'No restaurant linked' })
    }

    const updateFields = {}
    if (name !== undefined) updateFields.name = name
    if (category !== undefined) updateFields.category = category
    if (price !== undefined) updateFields.price = Number(price)
    if (description !== undefined) updateFields.description = description
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable

    const updatedExtra = await Extra.findOneAndUpdate(
      { _id: id, restaurant: restaurantId },  // ✅ FIXED
      updateFields,
      { new: true }
    )

    if (!updatedExtra) {
      return res.status(404).json({ success: false, message: 'Extra not found' })
    }

    return res.json({ success: true, data: updatedExtra, message: 'Extra updated successfully' })
  } catch (error) {
    console.error('updateRestaurantOwnerExtra error:', error)
    return res.status(500).json({ success: false, message: error.message || 'Failed to update extra' })
  }
}

export const deleteRestaurantOwnerExtra = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id
    const { id } = req.params

    const restaurantId = await getRestaurantOwnerRestaurantId(restaurantOwnerId)
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'No restaurant linked' })
    }

    const deletedExtra = await Extra.findOneAndDelete({
      _id: id,
      restaurant: restaurantId  // ✅ FIXED
    })

    if (!deletedExtra) {
      return res.status(404).json({ success: false, message: 'Extra not found' })
    }

    return res.json({ success: true, message: 'Extra deleted successfully', data: deletedExtra })
  } catch (error) {
    console.error('deleteRestaurantOwnerExtra error:', error)
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete extra' })
  }
}
