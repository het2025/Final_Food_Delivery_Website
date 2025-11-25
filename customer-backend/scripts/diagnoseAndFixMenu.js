require('dotenv').config();
const mongoose = require('mongoose');

const diagnoseAndFixMenu = async () => {
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

    console.log('\n✅ Found restaurant:', restaurant.name);
    console.log('📊 Restaurant ID:', restaurant._id);
    console.log('📊 Owner ID:', restaurant.owner);
    
    console.log('\n📋 CURRENT MENU STRUCTURE:');
    console.log('Menu type:', Array.isArray(restaurant.menu) ? 'Array' : typeof restaurant.menu);
    console.log('Menu length:', restaurant.menu?.length || 0);
    console.log('Full menu:', JSON.stringify(restaurant.menu, null, 2));

    // Analyze menu structure
    if (!restaurant.menu || restaurant.menu.length === 0) {
      console.log('\n❌ PROBLEM: Menu is empty or null');
      console.log('✅ SOLUTION: Add menu items from restaurant owner dashboard');
    } else if (restaurant.menu[0].category && restaurant.menu[0].items) {
      console.log('\n✅ Menu structure is CORRECT (category-based)');
      console.log(`   Categories: ${restaurant.menu.length}`);
      console.log(`   Total items: ${restaurant.menu.reduce((sum, cat) => sum + (cat.items?.length || 0), 0)}`);
      
      // Check for cat_0
      const hasCat0 = restaurant.menu.some(cat => cat.category === 'cat_0' || cat.category.startsWith('cat_'));
      if (hasCat0) {
        console.log('\n⚠️  WARNING: Found "cat_0" categories - needs fixing');
        
        // Fix cat_0 categories
        const fixedMenu = restaurant.menu.map(cat => {
          if (cat.category === 'cat_0' || cat.category.startsWith('cat_')) {
            return {
              ...cat,
              category: 'Starters'  // Default to Starters, change as needed
            };
          }
          return cat;
        });
        
        await collection.updateOne(
          { _id: restaurant._id },
          { $set: { menu: fixedMenu } }
        );
        
        console.log('✅ Fixed cat_0 categories to "Starters"');
      }
    } else if (restaurant.menu[0].name && restaurant.menu[0].category) {
      console.log('\n⚠️  PROBLEM: Menu is flat array (old structure)');
      console.log('✅ SOLUTION: Converting to category structure...');
      
      // Convert flat to category structure
      const categoryMap = new Map();
      restaurant.menu.forEach(item => {
        const catName = (item.category === 'cat_0' || item.category?.startsWith('cat_')) 
          ? 'Starters' 
          : item.category || 'Uncategorized';
        
        if (!categoryMap.has(catName)) {
          categoryMap.set(catName, []);
        }
        
        categoryMap.get(catName).push({
          name: item.name,
          description: item.description || '',
          price: item.price,
          url: item.image || item.url || '',
          image: item.image || item.url || '',
          isVeg: item.isVeg !== undefined ? item.isVeg : true,
          isPopular: item.isPopular || false,
          preparationTime: item.preparationTime || 15,
          _id: item._id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        });
      });
      
      const newMenu = Array.from(categoryMap.entries()).map(([category, items]) => ({
        category,
        items
      }));
      
      await collection.updateOne(
        { _id: restaurant._id },
        { $set: { menu: newMenu } }
      );
      
      console.log('✅ Converted to category structure');
      console.log('📊 New structure:', JSON.stringify(newMenu, null, 2));
    } else {
      console.log('\n❌ PROBLEM: Unknown menu structure');
      console.log('Menu item example:', restaurant.menu[0]);
    }

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const updatedRestaurant = await collection.findOne({ _id: restaurant._id });
    console.log('📊 Updated menu length:', updatedRestaurant.menu?.length || 0);
    console.log('📊 Updated menu structure:', JSON.stringify(updatedRestaurant.menu, null, 2));

    console.log('\n✅ Diagnosis complete!');
    console.log('💡 Next step: Refresh customer frontend to see changes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

diagnoseAndFixMenu();
