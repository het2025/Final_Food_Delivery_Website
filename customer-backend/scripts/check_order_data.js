import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const checkLatestOrder = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const latestOrder = await Order.findOne().sort({ createdAt: -1 });

        if (latestOrder) {
            console.log('📦 LATEST ORDER DEBUG 📦');
            console.log('-------------------------');
            console.log('Order ID (_id):', latestOrder._id);
            console.log('User Field:', latestOrder.user);
            console.log('User Field Type:', typeof latestOrder.user);
            console.log('Status:', latestOrder.status);
            console.log('Restaurant Name:', latestOrder.restaurantName);
            console.log('Created At:', latestOrder.createdAt);
            console.log('-------------------------');
        } else {
            console.log('❌ No orders found in database.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
};

checkLatestOrder();
