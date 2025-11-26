const mongoose = require('mongoose');
require('dotenv').config();

const removeDuplicates = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const db = mongoose.connection.db;
        const collection = db.collection('new_registered_restaurants');

        // Find all duplicates by name
        const duplicates = await collection.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                    docs: { $push: { id: "$_id", createdAt: "$createdAt", restaurantId: "$restaurantId" } }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]).toArray();

        console.log(`Found ${duplicates.length} duplicate restaurant name(s)\n`);

        let totalRemoved = 0;

        for (const dup of duplicates) {
            console.log(`Processing duplicates for: ${dup._id}`);
            console.log(`  Total count: ${dup.count}`);

            // Sort by createdAt descending to keep the most recent one
            const sorted = dup.docs.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            });

            // Keep the first (most recent), remove the rest
            const toKeep = sorted[0];
            const toRemove = sorted.slice(1);

            console.log(`  Keeping: ID ${toKeep.id} (created: ${toKeep.createdAt || 'N/A'})`);
            console.log(`  Removing ${toRemove.length} duplicate(s):`);

            for (const doc of toRemove) {
                console.log(`    - ID ${doc.id} (created: ${doc.createdAt || 'N/A'})`);
                await collection.deleteOne({ _id: doc.id });
                totalRemoved++;
            }

            console.log('');
        }

        console.log(`✅ Cleanup complete. Removed ${totalRemoved} duplicate restaurant(s).`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit();
    }
};

removeDuplicates();
