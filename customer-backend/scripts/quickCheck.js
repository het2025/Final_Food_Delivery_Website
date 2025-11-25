require('dotenv').config();
const mongoose = require('mongoose');

const quickCheck = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('new_registered_restaurants');

    const restaurant = await collection.findOne({ 
      _id: new mongoose.Types.ObjectId('691d59d90f870c7e4e50146b')
    });

    console.log('\n📊 RESTAURANT DATA FROM DATABASE:');
    console.log('Name:', restaurant?.name);
    console.log('ID:', restaurant?._id);
    console.log('\n📊 MENU DATA:');
    console.log('Menu exists:', !!restaurant?.menu);
    console.log('Menu type:', typeof restaurant?.menu);
    console.log('Is array:', Array.isArray(restaurant?.menu));
    console.log('Menu length:', restaurant?.menu?.length);
    console.log('\n📋 FULL MENU CONTENT:');
    console.log(JSON.stringify(restaurant?.menu, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

quickCheck();
