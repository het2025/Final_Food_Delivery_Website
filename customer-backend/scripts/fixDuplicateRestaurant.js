require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');

const fixDuplicates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find ALL Lassi wala restaurants
    const lassiWalaRestaurants = await Restaurant.find({ name: 'Lassi wala' });
    
    console.log(`\n📊 Found ${lassiWalaRestaurants.length} "Lassi wala" restaurants:`);
    lassiWalaRestaurants.forEach((r, i) => {
      console.log(`  ${i + 1}. ID: ${r._id}, Status: ${r.status}, Active: ${r.isActive}`);
    });

    if (lassiWalaRestaurants.length <= 1) {
      console.log('\n✅ No duplicates found!');
      process.exit(0);
    }

    // Keep the one with menu items, or the first active one
    let keepRestaurant = lassiWalaRestaurants.find(r => r.isActive && r.status === 'active');
    if (!keepRestaurant) keepRestaurant = lassiWalaRestaurants[0];

    console.log(`\n✅ Keeping restaurant: ${keepRestaurant._id}`);

    // Get other IDs to remove
    const removeIds = lassiWalaRestaurants
      .filter(r => r._id.toString() !== keepRestaurant._id.toString())
      .map(r => r._id);

    console.log(`\n🗑️ Removing duplicate restaurants:`, removeIds);

    // Update menu items and categories to point to the kept restaurant
    for (const oldId of removeIds) {
      const itemsUpdated = await MenuItem.updateMany(
        { restaurant: oldId },
        { $set: { restaurant: keepRestaurant._id } }
      );
      
      const categoriesUpdated = await MenuCategory.updateMany(
        { restaurant: oldId },
        { $set: { restaurant: keepRestaurant._id } }
      );
      
      console.log(`  - Moved ${itemsUpdated.modifiedCount} items and ${categoriesUpdated.modifiedCount} categories from ${oldId}`);
    }

    // Delete duplicate restaurants
    const deleteResult = await Restaurant.deleteMany({ _id: { $in: removeIds } });
    console.log(`\n✅ Deleted ${deleteResult.deletedCount} duplicate restaurants`);

    console.log(`\n🎉 Final restaurant ID: ${keepRestaurant._id}`);
    console.log(`   Name: ${keepRestaurant.name}`);
    
    const finalItems = await MenuItem.countDocuments({ restaurant: keepRestaurant._id });
    const finalCategories = await MenuCategory.countDocuments({ restaurant: keepRestaurant._id });
    console.log(`   Menu items: ${finalItems}`);
    console.log(`   Categories: ${finalCategories}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixDuplicates();
