import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';

dotenv.config();

const checkPrices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const restaurants = await Restaurant.find({}, 'name priceRange');

        console.log('📦 RESTAURANT PRICE DATA 📦');
        console.log('-------------------------');
        restaurants.forEach(r => {
            console.log(`- ${r.name}: ${r.priceRange || 'N/A'}`);
        });
        console.log('-------------------------');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkPrices();
