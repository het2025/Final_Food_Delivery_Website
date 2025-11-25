require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const cleanupUsers = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Starting user cleanup...');
    
    // Drop the entire users collection
    await mongoose.connection.db.collection('users').drop();
    console.log('✅ Users collection dropped');
    
    // Recreate the collection
    await mongoose.connection.db.createCollection('users');
    console.log('✅ Users collection recreated');
    
    // Create unique index on email
    await mongoose.connection.db.collection('users').createIndex(
      { email: 1 }, 
      { unique: true, background: true }
    );
    console.log('✅ Unique index on email created');
    
    console.log('🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

cleanupUsers();
