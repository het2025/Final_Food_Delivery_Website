import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';

dotenv.config();

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const restaurants = await Restaurant.find({}, 'name status isActive');

        console.log('📦 RESTAURANT STATUS CHECK 📦');
        console.log('-----------------------------');
        console.log('Total Count:', restaurants.length);
        restaurants.forEach(r => {
            console.log(`- Name: ${r.name}`);
            console.log(`  Status: ${r.status}`);
            console.log(`  IsActive: ${r.isActive}`);
            console.log('---');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkStatus();
