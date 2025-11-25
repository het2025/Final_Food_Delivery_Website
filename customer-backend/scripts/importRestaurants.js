require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const fs = require('fs');
const path = require('path');

const importRestaurants = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database:', mongoose.connection.name);

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../data/restaurants.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log('❌ restaurants.json file not found!');
      console.log('   Please place restaurants.json in:', path.join(__dirname, '../data/'));
      process.exit(1);
    }

    const restaurantsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`\n📊 Found ${restaurantsData.length} restaurants in JSON file`);

    // Clear existing restaurants (optional - remove this if you want to keep existing data)
    console.log('\n🗑️  Clearing existing restaurants...');
    await Restaurant.deleteMany({});
    console.log('✅ Cleared existing restaurants');

    // Import restaurants
    console.log('\n📥 Importing restaurants...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const restaurantData of restaurantsData) {
      try {
        // Transform data to match your schema
        const restaurant = new Restaurant({
          restaurantId: `REST_${restaurantData.id}`,
          name: restaurantData.name,
          description: restaurantData.description,
          image: restaurantData.image,
          rating: restaurantData.rating,
          totalReviews: restaurantData.totalReviews,
          deliveryTime: restaurantData.deliveryTime,
          location: {
            area: restaurantData.location.area,
            address: restaurantData.location.address,
            coordinates: restaurantData.location.coordinates
          },
          contact: {
            phone: restaurantData.contact.phone,
            email: restaurantData.contact.email
          },
          cuisine: restaurantData.cuisine,
          priceRange: restaurantData.priceRange,
          features: restaurantData.features,
          status: restaurantData.status || 'active',
          isActive: true,
          menu: restaurantData.menu // Embedded menu
        });

        await restaurant.save();
        successCount++;
        console.log(`✅ ${successCount}. ${restaurantData.name} - Imported`);
      } catch (error) {
        errorCount++;
        console.log(`❌ ${restaurantData.name} - Error: ${error.message}`);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`   ✅ Successfully imported: ${successCount} restaurants`);
    console.log(`   ❌ Failed: ${errorCount} restaurants`);

    // Show sample of imported restaurants
    console.log('\n📋 Sample of imported restaurants:');
    const samples = await Restaurant.find().limit(5).select('name location.area cuisine');
    samples.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} - ${r.location.area} (${r.cuisine[0]})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

importRestaurants();
