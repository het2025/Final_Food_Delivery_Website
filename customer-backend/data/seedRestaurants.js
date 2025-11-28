import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import connectDB from '../config/database.js';
import { readFile } from 'fs/promises';

// Your restaurants data
const restaurantsData = JSON.parse(
  await readFile(new URL('./restaurants.json', import.meta.url))
);

const importData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing restaurants...');
    await Restaurant.deleteMany({});
    console.log('✅ Existing restaurants cleared');

    console.log(`📦 Starting import of ${restaurantsData.length} restaurants...`);

    // Track successful and failed imports
    let successCount = 0;
    let failedCount = 0;
    const failedRestaurants = [];

    // Process restaurants one by one to catch individual errors
    for (let i = 0; i < restaurantsData.length; i++) {
      try {
        const restaurant = restaurantsData[i];

        // Transform and validate data
        const transformedData = {
          restaurantId: restaurant.id,
          name: restaurant.name,
          description: restaurant.description,
          image: restaurant.image,
          rating: restaurant.rating || 0,
          totalReviews: restaurant.totalReviews || 0,
          deliveryTime: restaurant.deliveryTime,
          location: {
            area: restaurant.location?.area || '',
            address: restaurant.location?.address || '',
            coordinates: restaurant.location?.coordinates || [0, 0]
          },
          contact: {
            phone: restaurant.contact?.phone || '',
            email: restaurant.contact?.email || ''
          },
          cuisine: restaurant.cuisine || [],
          priceRange: restaurant.priceRange || '',
          features: restaurant.features || [],
          status: restaurant.status || 'active',
          menu: restaurant.menu || [],
          isActive: true,
          isVerified: true
        };

        // Validate required fields
        if (!transformedData.name) {
          throw new Error('Name is required');
        }
        if (!transformedData.location.area) {
          throw new Error('Location area is required');
        }
        if (!transformedData.location.address) {
          throw new Error('Location address is required');
        }
        if (!transformedData.cuisine.length) {
          throw new Error('At least one cuisine type is required');
        }

        // Create restaurant
        await Restaurant.create(transformedData);
        successCount++;

        if (successCount % 10 === 0) {
          console.log(`✅ Processed ${successCount}/${restaurantsData.length} restaurants`);
        }

      } catch (error) {
        failedCount++;
        const restaurant = restaurantsData[i];
        failedRestaurants.push({
          index: i + 1,
          id: restaurant.id,
          name: restaurant.name,
          error: error.message
        });

        console.log(`❌ Failed to import restaurant #${i + 1} (ID: ${restaurant.id}): ${error.message}`);
      }
    }

    const totalRestaurants = await Restaurant.countDocuments();

    console.log('\n🎉 Import Summary:');
    console.log(`   📊 Total in JSON file: ${restaurantsData.length}`);
    console.log(`   ✅ Successfully imported: ${successCount}`);
    console.log(`   ❌ Failed to import: ${failedCount}`);
    console.log(`   📈 Total in database: ${totalRestaurants}`);

    if (failedRestaurants.length > 0) {
      console.log('\n❌ Failed Restaurants Details:');
      failedRestaurants.forEach(failed => {
        console.log(`   #${failed.index}: ${failed.name} (ID: ${failed.id})`);
        console.log(`   Error: ${failed.error}\n`);
      });
    }

    // Calculate statistics for successfully imported restaurants
    if (successCount > 0) {
      const stats = await Restaurant.aggregate([
        {
          $group: {
            _id: null,
            totalRestaurants: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            cuisineTypes: { $addToSet: { $arrayElemAt: ['$cuisine', 0] } },
            areas: { $addToSet: '$location.area' }
          }
        }
      ]);

      if (stats[0]) {
        console.log('\n📊 Database Statistics:');
        console.log(`   Average Rating: ${stats[0].averageRating.toFixed(1)}`);
        console.log(`   Unique Areas: ${stats[0].areas.length}`);
        console.log(`   Cuisine Types: ${stats[0].cuisineTypes.length}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Command to validate data without importing
const validateData = async () => {
  try {
    console.log(`🔍 Validating ${restaurantsData.length} restaurants...`);

    const errors = [];

    for (let i = 0; i < restaurantsData.length; i++) {
      const restaurant = restaurantsData[i];
      const issues = [];

      // Check required fields
      if (!restaurant.name) issues.push('Missing name');
      if (!restaurant.id) issues.push('Missing id');
      if (!restaurant.location?.area) issues.push('Missing location.area');
      if (!restaurant.location?.address) issues.push('Missing location.address');
      if (!restaurant.cuisine || restaurant.cuisine.length === 0) issues.push('Missing cuisine');
      if (!restaurant.deliveryTime) issues.push('Missing deliveryTime');

      // Check data types
      if (restaurant.rating && (typeof restaurant.rating !== 'number' || restaurant.rating < 0 || restaurant.rating > 5)) {
        issues.push('Invalid rating (should be 0-5)');
      }

      if (restaurant.totalReviews && (typeof restaurant.totalReviews !== 'number' || restaurant.totalReviews < 0)) {
        issues.push('Invalid totalReviews (should be positive number)');
      }

      // Check for duplicate IDs
      const duplicateIndex = restaurantsData.findIndex((r, idx) => idx !== i && r.id === restaurant.id);
      if (duplicateIndex !== -1) {
        issues.push(`Duplicate ID found at index ${duplicateIndex + 1}`);
      }

      if (issues.length > 0) {
        errors.push({
          index: i + 1,
          id: restaurant.id,
          name: restaurant.name,
          issues
        });
      }
    }

    if (errors.length === 0) {
      console.log('✅ All restaurants are valid!');
    } else {
      console.log(`❌ Found ${errors.length} restaurants with issues:`);
      errors.forEach(error => {
        console.log(`\n   #${error.index}: ${error.name} (ID: ${error.id})`);
        error.issues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--validate') || args.includes('-v')) {
  validateData();
} else if (args.includes('--delete') || args.includes('-d')) {
  // Delete all restaurants
  connectDB().then(async () => {
    console.log('🗑️  Deleting all restaurants...');
    await Restaurant.deleteMany({});
    console.log('✅ All restaurants deleted');
    process.exit(0);
  });
} else {
  importData();
}
