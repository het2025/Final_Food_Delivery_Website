require('dotenv').config();
const mongoose = require('mongoose');

const findLassiWala = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database:', mongoose.connection.name);

    const db = mongoose.connection.db;

    // Check main restaurants collection
    const mainCollection = db.collection('restaurants');
    const mainRestaurants = await mainCollection.find({ name: /Lassi wala/i }).toArray();
    
    console.log(`\n📊 "restaurants" collection: ${mainRestaurants.length} found`);
    mainRestaurants.forEach((r, i) => {
      console.log(`  ${i + 1}. ID: ${r._id}`);
      console.log(`     Name: ${r.name}`);
      console.log(`     Menu items: ${r.menu?.length || 0}`);
      console.log(`     Menu structure:`, r.menu?.[0] ? 'Has items' : 'Empty');
      console.log('');
    });

    // Check new_registered_restaurants collection
    const newCollection = db.collection('new_registered_restaurants');
    const newRestaurants = await newCollection.find({ name: /Lassi wala/i }).toArray();
    
    console.log(`\n📊 "new_registered_restaurants" collection: ${newRestaurants.length} found`);
    newRestaurants.forEach((r, i) => {
      console.log(`  ${i + 1}. ID: ${r._id}`);
      console.log(`     Name: ${r.name}`);
      console.log(`     Owner: ${r.owner}`);
      console.log(`     Menu items: ${r.menu?.length || 0}`);
      if (r.menu && r.menu.length > 0) {
        console.log(`     Menu structure:`, JSON.stringify(r.menu[0], null, 2));
      }
      console.log('');
    });

    console.log('\n💡 Customer is viewing ID: 691d59d90f870c7e4e50146b');
    console.log('🔍 Check which restaurant has this ID and verify it has menu items\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

findLassiWala();
