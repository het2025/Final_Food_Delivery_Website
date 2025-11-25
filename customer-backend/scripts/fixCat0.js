require('dotenv').config();
const mongoose = require('mongoose');

const fixCat0 = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('new_registered_restaurants');

    // Find Lassi wala
    const restaurant = await collection.findOne({ 
      _id: new mongoose.Types.ObjectId('691d59d90f870c7e4e50146b')
    });

    if (!restaurant) {
      console.log('❌ Restaurant not found');
      process.exit(1);
    }

    console.log('✅ Found restaurant:', restaurant.name);
    console.log('📊 Current menu:', JSON.stringify(restaurant.menu, null, 2));

    // Fix all cat_0 categories to "Starters" (or ask which category it should be)
    if (restaurant.menu && Array.isArray(restaurant.menu)) {
      restaurant.menu = restaurant.menu.map(category => {
        if (category.category === 'cat_0') {
          console.log('🔧 Fixing cat_0 to "Starters"');
          return {
            ...category,
            category: 'Starters'  // Change this to the actual category you want
          };
        }
        return category;
      });

      // Update in database
      await collection.updateOne(
        { _id: restaurant._id },
        { $set: { menu: restaurant.menu } }
      );

      console.log('✅ Menu updated successfully!');
      console.log('📊 New menu:', JSON.stringify(restaurant.menu, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCat0();
