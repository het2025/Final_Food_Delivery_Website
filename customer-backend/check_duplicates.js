const mongoose = require('mongoose');
require('dotenv').config();

const checkDuplicates = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const db = mongoose.connection.db;
        const collection = db.collection('new_registered_restaurants');

        // Group by restaurantId to find duplicates
        const duplicates = await collection.aggregate([
            {
                $group: {
                    _id: "$restaurantId",
                    count: { $sum: 1 },
                    ids: { $push: "$_id" },
                    names: { $push: "$name" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]).toArray();

        console.log(`Found ${duplicates.length} duplicate restaurantId(s):`);
        duplicates.forEach(dup => {
            console.log(`- restaurantId: ${dup._id}`);
            console.log(`  Count: ${dup.count}`);
            console.log(`  Names: ${dup.names.join(', ')}`);
            console.log(`  IDs: ${dup.ids.join(', ')}`);
        });

        // Also check by name
        const nameDuplicates = await collection.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                    ids: { $push: "$_id" },
                    restaurantIds: { $push: "$restaurantId" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]).toArray();

        console.log(`\nFound ${nameDuplicates.length} duplicate name(s):`);
        nameDuplicates.forEach(dup => {
            console.log(`- Name: ${dup._id}`);
            console.log(`  Count: ${dup.count}`);
            console.log(`  RestaurantIds: ${dup.restaurantIds.join(', ')}`);
            console.log(`  IDs: ${dup.ids.join(', ')}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

checkDuplicates();
