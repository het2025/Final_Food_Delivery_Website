import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
    console.log('Connecting to:', process.env.MONGO_URI);

    // Create connection like in controller
    const conn = mongoose.createConnection(process.env.MONGO_URI);
    await conn.asPromise();
    console.log('Connection readyState:', conn.readyState);

    // Get collection
    const collection = conn.collection('orders');
    console.log('Collection name:', collection.collectionName);

    // Test aggregate
    console.log('Testing aggregate...');
    const result = collection.aggregate([
        { $limit: 1 }
    ]);

    console.log('Result constructor:', result.constructor.name);
    console.log('Has toArray?', typeof result.toArray === 'function');

    try {
        const data = await result.toArray();
        console.log('Data:', data);
    } catch (err) {
        console.error('Error calling toArray:', err);
    }

    await conn.close();
};

testConnection().catch(console.error);
