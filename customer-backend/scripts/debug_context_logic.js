import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Restaurant from '../models/Restaurant.js';

dotenv.config();

const debugContext = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const restaurants = await Restaurant.find({
            isActive: true,
            status: 'approved'
        })
            .select('name cuisine averageRating address.city menu restaurantId priceRange')
            .lean();

        console.log(`Found ${restaurants.length} restaurants.`);

        const contextList = restaurants.map(r => {
            let userHighlights = [];
            let minPrice = Infinity;
            let maxPrice = 0;

            if (r.menu && r.menu.length > 0) {
                r.menu.forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            // Track Prices
                            if (item.price) {
                                if (item.price < minPrice) minPrice = item.price;
                                if (item.price > maxPrice) maxPrice = item.price;
                            }
                            // Track Highlights
                            if (item.isPopular || userHighlights.length < 5) {
                                userHighlights.push(item.name);
                            }
                        });
                    }
                });
            }

            // Fallback if no prices found
            if (minPrice === Infinity) minPrice = "N/A";
            if (maxPrice === 0) maxPrice = "N/A";

            const priceString = (minPrice !== "N/A") ? `₹${minPrice}-₹${maxPrice}` : r.priceRange || 'N/A';
            const uniqueHighlights = [...new Set(userHighlights)].slice(0, 8).join(', ');

            return `ID: ${r._id} | Name: ${r.name} | Avg Cost: ${priceString} | Cuisine: ${r.cuisine?.join(', ')} | Rating: ${r.averageRating}⭐ | Top Items: ${uniqueHighlights}`;
        }).join('\n');

        console.log("------------------- GENERATED CONTEXT -------------------");
        console.log(contextList);
        console.log("---------------------------------------------------------");

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugContext();
