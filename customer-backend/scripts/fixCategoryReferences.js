require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
const Restaurant = require('../models/Restaurant');

const fixCategoryReferences = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find Lassi wala restaurant
    const restaurant = await Restaurant.findOne({ name: 'Lassi wala' });
    if (!restaurant) {
      console.log('❌ Lassi wala restaurant not found!');
      process.exit(1);
    }

    console.log(`✅ Found restaurant: ${restaurant.name} (${restaurant._id})`);

    // Get all categories for this restaurant
    const categories = await MenuCategory.find({ 
      restaurant: restaurant._id 
    });

    console.log(`\n📊 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat._id})`);
    });

    // Get all menu items for this restaurant
    const menuItems = await MenuItem.find({ 
      restaurant: restaurant._id 
    });

    console.log(`\n📊 Found ${menuItems.length} menu items`);

    // Create category mapping based on item names
    const categoryMapping = {
      'Garlic Bread': 'Starters',
      'Chicken Wings': 'Starters',
      'Margherita Pizza': 'Main Course',
      'Chicken Pizza': 'Main Course',
      'Chocolate Cake': 'Desserts',
      'Pepsi': 'Beverages',
    };

    console.log('\n🔧 Fixing category references...\n');

    let fixedCount = 0;
    
    for (const item of menuItems) {
      // Get the expected category name for this item
      const expectedCategoryName = categoryMapping[item.name];
      
      if (!expectedCategoryName) {
        console.log(`⚠️  "${item.name}" - No mapping found, skipping`);
        continue;
      }

      // Find the category (use first match if duplicates exist)
      const category = categories.find(c => c.name === expectedCategoryName);
      
      if (!category) {
        console.log(`❌ "${item.name}" - Category "${expectedCategoryName}" not found`);
        continue;
      }

      // Update the item's category reference
      const oldCategory = item.category;
      item.category = category._id;
      await item.save();
      
      console.log(`✅ "${item.name}" → Category: ${category.name} (${category._id})`);
      fixedCount++;
    }

    console.log(`\n🎉 Fixed ${fixedCount} menu items!`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const verifyItems = await MenuItem.find({ 
      restaurant: restaurant._id 
    }).populate('category', 'name');

    console.log('\n📋 Verification Results:');
    verifyItems.forEach(item => {
      console.log(`  - ${item.name}: ${item.category?.name || 'NO CATEGORY'}`);
    });

    const itemsWithoutCategory = verifyItems.filter(i => !i.category);
    if (itemsWithoutCategory.length === 0) {
      console.log('\n✅ All items have valid categories!');
    } else {
      console.log(`\n⚠️  ${itemsWithoutCategory.length} items still have no category`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCategoryReferences();
