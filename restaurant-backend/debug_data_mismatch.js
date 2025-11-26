import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { RestaurantOwner } from './src/models/RestaurantOwner.js';
import { Restaurant } from './src/models/Restaurant.js';

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('debug_output.txt', msg + '\n');
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        log(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugData = async () => {
    fs.writeFileSync('debug_output.txt', ''); // Clear log

    try {
        await connectDB();

        log('\n========== RESTAURANT OWNERS ==========');
        const owners = await RestaurantOwner.find({});
        log(`Found ${owners.length} owners`);
        owners.forEach(owner => {
            log(`ID: ${owner._id}, Name: ${owner.name}, Email: ${owner.email}, RestaurantLink: ${owner.restaurant}`);
        });

        log('\n========== RESTAURANTS (New Collection) ==========');
        const restaurants = await Restaurant.find({});
        log(`Found ${restaurants.length} restaurants`);
        restaurants.forEach(rest => {
            log(`ID: ${rest._id}, Name: ${rest.name}, OwnerID: ${rest.owner}`);
        });

        log('\n========== RESTAURANTS (Legacy Collection) ==========');
        // Define legacy model dynamically
        // Check if model already exists to avoid OverwriteModelError
        const LegacyRestaurant = mongoose.models.LegacyRestaurant || mongoose.model('LegacyRestaurant', Restaurant.schema, 'restaurants');

        const legacyRestaurants = await LegacyRestaurant.find({});
        log(`Found ${legacyRestaurants.length} legacy restaurants`);
        legacyRestaurants.forEach(rest => {
            log(`ID: ${rest._id}, Name: ${rest.name}, OwnerID: ${rest.owner}`);
        });

        log('\n========== DIAGNOSIS ==========');
        for (const owner of owners) {
            const newRest = restaurants.find(r => r.owner && r.owner.toString() === owner._id.toString());
            const legacyRest = legacyRestaurants.find(r => r.owner && r.owner.toString() === owner._id.toString());

            if (newRest) {
                log(`✅ Owner ${owner.email} linked to NEW restaurant ${newRest.name}`);
            } else if (legacyRest) {
                log(`✅ Owner ${owner.email} linked to LEGACY restaurant ${legacyRest.name}`);
            } else {
                log(`❌ Owner ${owner.email} has NO RESTAURANT found!`);
            }
        }

    } catch (error) {
        log(`CRITICAL ERROR: ${error.message}`);
        log(error.stack);
    } finally {
        process.exit();
    }
};

debugData();
