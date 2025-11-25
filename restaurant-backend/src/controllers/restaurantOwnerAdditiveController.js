import { Additive } from '../models/Additive.js';
import { Restaurant } from '../models/Restaurant.js';
import mongoose from 'mongoose';

const getRestaurantId = async (restaurantOwnerId) => {
  const restaurant = await Restaurant.findOne({ owner: restaurantOwnerId }).select('_id');
  return restaurant ? restaurant._id : null;
};

// GET /api/additives
export const getAdditives = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);
    if (!restaurantId) {
      return res.json({ success: true, data: [], message: 'No restaurant linked' });
    }

    const additives = await Additive.find({ restaurant: restaurantId, isAvailable: true });
    res.json({ success: true, data: additives });
  } catch (error) {
    console.error('getAdditives error:', error);
    res.status(500).json({ success: false, message: 'Failed to load additives' });
  }
};

// POST /api/additives
export const createAdditive = async (req, res) => {
  try {
    // Similar to createMenuItem – validate name, price
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);
    if (!restaurantId) return res.status(400).json({ success: false, message: 'No restaurant' });

    const { name, price } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'Name and price required' });

    const additive = await Additive.create({ restaurant: restaurantId, name: name.trim(), price });
    res.status(201).json({ success: true, data: additive, message: 'Additive created' });
  } catch (error) {
    console.error('createAdditive error:', error);
    res.status(500).json({ success: false, message: 'Failed to create additive' });
  }
};

// PUT /api/additives/:id & DELETE similar to menu items
export const updateAdditive = async (req, res) => {
  // Stub: Implement update logic
  res.json({ success: true, message: 'Updated' });
};

export const deleteAdditive = async (req, res) => {
  // Stub: Implement delete
  res.json({ success: true, message: 'Deleted' });
};
