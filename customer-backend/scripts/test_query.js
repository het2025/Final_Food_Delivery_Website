import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const testQuery = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // The User ID from the logs
        const userId = "69188a0f30f9688ed93286a0";

        console.log(`🔍 Searching for orders for User: ${userId}`);

        // 1. Simple Find by User
        const allOrders = await Order.find({ user: userId });
        console.log(`➡️  Total Orders Found: ${allOrders.length}`);

        if (allOrders.length > 0) {
            console.log('   Latest Order Status:', allOrders[allOrders.length - 1].status);
        }

        // 2. Regex Find (The one failing)
        const statusRegex = /pending|confirmed|accepted|preparing|ready|out_for_delivery|out for delivery/i;
        const activeOrders = await Order.find({
            user: userId,
            status: { $regex: statusRegex }
        });

        console.log(`➡️  Active Orders (Regex) Found: ${activeOrders.length}`);
        activeOrders.forEach(o => console.log(`   - Order ${o._id}: ${o.status}`));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testQuery();
