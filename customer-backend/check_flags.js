const mongoose = require('mongoose');
require('dotenv').config();

const checkFlags = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const db = mongoose.connection.db;
        const collection = db.collection('restaurants');

        const approvedAtExists = await collection.countDocuments({ approvedAt: { $exists: true } });
        const approvedAtMissing = await collection.countDocuments({ approvedAt: { $exists: false } });

        console.log(`approvedAt: exists -> ${approvedAtExists}`);
        console.log(`approvedAt: missing -> ${approvedAtMissing}`);

        const sampleApproved = await collection.findOne({ approvedAt: { $exists: true } });
        if (sampleApproved) {
            console.log('Sample Approved Restaurant:', sampleApproved.name, sampleApproved.approvedAt);
        }

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

checkFlags();
