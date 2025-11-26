const mongoose = require('mongoose');
require('dotenv').config();

const checkPending = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const db = mongoose.connection.db;
        const collection = db.collection('new_registered_restaurants');

        const pending = await collection.find({}).sort({ createdAt: -1 }).limit(5).toArray();

        console.log(`Found ${pending.length} pending restaurants:`);
        pending.forEach(r => {
            console.log(`- ${r.name} (ID: ${r._id})`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

checkPending();
