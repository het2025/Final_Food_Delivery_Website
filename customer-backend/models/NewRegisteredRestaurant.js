import mongoose from 'mongoose';
import Restaurant from './Restaurant.js';

// Use the same schema as Restaurant but point to different collection
const NewRegisteredRestaurant = mongoose.model(
  'NewRegisteredRestaurant',
  Restaurant.schema,
  'new_registered_restaurants'  // ✅ Points to new collection
);

export default NewRegisteredRestaurant;
