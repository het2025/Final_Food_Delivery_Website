import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RestaurantOwner } from './src/models/RestaurantOwner.js';
import { Restaurant } from './src/models/Restaurant.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const repairData = async () => {
    await connectDB();

    const targetEmail = 'devesh@gamil.com';
    const targetRestaurantName = 'Fish Store';

    console.log(`\n🔧 Starting repair for ${targetEmail}...`);

    // 1. Find Owner
    const owner = await RestaurantOwner.findOne({ email: targetEmail });
    if (!owner) {
        console.error('❌ Owner not found!');
        process.exit(1);
    }
    console.log(`✅ Found Owner: ${owner.name} (${owner._id})`);
    console.log(`   Current Link: ${owner.restaurant}`);

    // 2. Find Legacy Restaurant
    // Use the same schema but point to 'restaurants' collection
    const LegacyRestaurant = mongoose.models.LegacyRestaurant || mongoose.model('LegacyRestaurant', Restaurant.schema, 'restaurants');

    const restaurants = await LegacyRestaurant.find({ name: targetRestaurantName });
    console.log(`Found ${restaurants.length} restaurants with name '${targetRestaurantName}'`);
    restaurants.forEach(r => console.log(` - ${r._id}: Owner ${r.owner}`));

    const restaurant = restaurants[0];
    if (!restaurant) {
        console.error(`❌ Legacy restaurant '${targetRestaurantName}' not found!`);
        process.exit(1);
    }
    console.log(`✅ Selected Restaurant: ${restaurant.name} (${restaurant._id})`);

    // 3. Fix Links
    console.log('\n🛠️  Fixing links...');

    // Update Owner
    owner.restaurant = restaurant._id;
    const savedOwner = await owner.save();
    console.log(`✅ Updated Owner's restaurant link to: ${savedOwner.restaurant}`);

    // Update Restaurant
    restaurant.owner = owner._id;
    // We need to ensure the 'owner' field is in the schema to save it. 
    // RestaurantSchema has 'owner', so it should work.
    const savedRestaurant = await restaurant.save();
    console.log(`✅ Updated Restaurant's owner link to: ${savedRestaurant.owner}`);

    // 4. Verify Immediate Read
    const verifyOwner = await RestaurantOwner.findById(owner._id);
    const verifyRest = await LegacyRestaurant.findById(restaurant._id);
    console.log('\n🔍 Verification Read:');
    console.log(`Owner points to: ${verifyOwner.restaurant}`);
    console.log(`Restaurant points to: ${verifyRest.owner}`);

    console.log('\n🎉 Repair Complete!');
    process.exit();
};

repairData();
