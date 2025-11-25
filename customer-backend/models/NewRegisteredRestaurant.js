const mongoose = require('mongoose');
const Restaurant = require('./Restaurant');

// Use the same schema as Restaurant but point to different collection
const NewRegisteredRestaurant = mongoose.model(
  'NewRegisteredRestaurant',
  Restaurant.schema,
  'new_registered_restaurants'  // ✅ Points to new collection
);

module.exports = NewRegisteredRestaurant;
