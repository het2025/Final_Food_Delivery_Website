import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    
    // Check restaurant owner
    const restaurantOwnerId = '691d59d80f870c7e4e501469'; // From your logs
    
    // Check new_registered_restaurants
    const newRestaurantsCollection = db.collection('new_registered_restaurants');
    const restaurant = await newRestaurantsCollection.findOne({
      owner: new mongoose.Types.ObjectId(restaurantOwnerId)
    });
    
    console.log('\n📊 Restaurant for owner:', restaurant ? 'Found' : 'Not found');
    if (restaurant) {
      console.log('   Restaurant ID:', restaurant._id);
      console.log('   Restaurant Name:', restaurant.name);
    }
    
    // Check orders collection
    const ordersCollection = db.collection('orders');
    
    // Find all orders
    const allOrders = await ordersCollection.find({}).toArray();
    console.log(`\n📊 Total orders in database: ${allOrders.length}`);
    
    if (restaurant) {
      // Find orders for this restaurant
      const restaurantOrders = await ordersCollection.find({
        restaurant: restaurant._id
      }).toArray();
      
      console.log(`📊 Orders for ${restaurant.name}: ${restaurantOrders.length}`);
      
      if (restaurantOrders.length > 0) {
        console.log('\n✅ Orders found:');
        restaurantOrders.forEach((order, i) => {
          console.log(`\n${i + 1}. Order #${order.orderNumber}`);
          console.log(`   Status: ${order.status}`);
          console.log(`   Total: ₹${order.totalAmount || order.total}`);
          console.log(`   Restaurant: ${order.restaurant}`);
        });
      }
    }
    
    // Show all orders regardless
    if (allOrders.length > 0) {
      console.log('\n📋 All orders in database:');
      allOrders.forEach((order, i) => {
        console.log(`\n${i + 1}. Order #${order.orderNumber || order.orderId}`);
        console.log(`   Restaurant ID: ${order.restaurant}`);
        console.log(`   Status: ${order.status}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkOrders();
