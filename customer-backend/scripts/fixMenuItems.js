require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
const Restaurant = require('../models/Restaurant');

const fixMenuItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find the Lassi wala restaurant
    const lassiWala = await Restaurant.findOne({ name: 'Lassi wala' });
    
    if (!lassiWala) {
      console.log('❌ Lassi wala restaurant not found!');
      process.exit(1);
    }

    console.log('✅ Found Lassi wala restaurant:', lassiWala._id);

    // Update ALL menu items that have undefined or null restaurant field
    const itemsResult = await MenuItem.updateMany(
      { 
        $or: [
          { restaurant: { $exists: false } },
          { restaurant: null },
          { restaurant: undefined }
        ]
      },
      { $set: { restaurant: lassiWala._id } }
    );
    
    console.log(`✅ Updated ${itemsResult.modifiedCount} menu items`);

    // Update ALL categories that have undefined or null restaurant field
    const categoriesResult = await MenuCategory.updateMany(
      { 
        $or: [
          { restaurant: { $exists: false } },
          { restaurant: null },
          { restaurant: undefined }
        ]
      },
      { $set: { restaurant: lassiWala._id } }
    );
    
    console.log(`✅ Updated ${categoriesResult.modifiedCount} categories`);

    // Show the updated items
    const updatedItems = await MenuItem.find({ restaurant: lassiWala._id });
    console.log('\n📋 Updated Menu Items:');
    updatedItems.forEach(item => {
      console.log(`  - ${item.name} (Restaurant: ${item.restaurant})`);
    });

    console.log('\n🎉 Fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixMenuItems();
