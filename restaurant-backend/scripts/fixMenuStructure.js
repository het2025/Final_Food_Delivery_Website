import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Restaurant } from '../src/models/Restaurant.js';

dotenv.config();

const fixMenuStructure = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find Lassi wala
    const restaurant = await Restaurant.findOne({ name: 'Lassi wala' });
    
    if (!restaurant) {
      console.log('❌ Lassi wala not found');
      process.exit(1);
    }

    console.log('✅ Found restaurant:', restaurant.name);
    console.log('📊 Current menu structure:', JSON.stringify(restaurant.menu, null, 2));

    // Clear the wrongly structured menu
    restaurant.menu = [];
    restaurant.markModified('menu');
    await restaurant.save();

    console.log('✅ Menu cleared. You can now add items with the correct structure.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixMenuStructure();
