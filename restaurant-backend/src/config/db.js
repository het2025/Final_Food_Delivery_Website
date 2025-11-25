import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || 'quickbite_restaurant_owners',  // Fixed: Restaurant owner themed DB
      retryWrites: true,  // Added: For MongoDB 4.0+ reliability
      w: 'majority'  // Added: Write concern
    });

    console.log(`MongoDB connected: ${conn.connection.host} (DB: ${process.env.MONGO_DB_NAME || 'quickbite_restaurant_owners'})`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);  // Exit on DB failure
  }
};
