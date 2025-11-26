const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const CUSTOMER_API = 'http://localhost:5000/api/restaurants/newly-registered';
const RESTAURANT_API = 'http://localhost:5001/api/auth/register';

const runVerification = async () => {
    try {
        // 1. Register New Restaurant
        console.log('\n📝 Registering new restaurant...');
        const uniqueId = Math.random().toString(36).substring(7);
        const regData = {
            name: `Visibility Test ${uniqueId}`,
            email: `vis${uniqueId}@test.com`,
            password: 'password123',
            phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
            restaurant: {
                name: `Visibility Test ${uniqueId}`,
                description: 'Test Description',
                cuisine: ['Test'],
                location: {
                    area: 'Test Area',
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456'
                },
                contact: {
                    phone: '1234567890',
                    email: `vis${uniqueId}@test.com`
                }
            }
        };

        const regRes = await axios.post(RESTAURANT_API, regData);
        if (!regRes.data.success) throw new Error('Registration failed');
        console.log(`✅ Registered: ${regData.restaurant.name}`);

        // 2. Check Visibility (Should be FALSE)
        console.log('\n🔍 Checking visibility (Expect: NOT FOUND)...');
        const res1 = await axios.get(CUSTOMER_API);
        const found1 = res1.data.data.find(r => r.name === regData.restaurant.name);

        if (found1) {
            console.error('❌ FAILURE: Unapproved restaurant IS visible!');
        } else {
            console.log('✅ SUCCESS: Unapproved restaurant is NOT visible.');
        }

        // 3. Simulate Approval (Move to main collection)
        console.log('\n👮 Simulating Admin Approval...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        const newColl = db.collection('new_registered_restaurants');
        const mainColl = db.collection('restaurants');

        const pending = await newColl.findOne({ name: regData.restaurant.name });
        if (!pending) throw new Error('Pending restaurant not found in DB');

        // Move to main
        await mainColl.insertOne({
            ...pending,
            status: 'active',
            isActive: true,
            approvedAt: new Date(),
            isNewlyRegistered: true
        });
        await newColl.deleteOne({ _id: pending._id });
        console.log('✅ Restaurant approved and moved to main collection.');

        // 4. Check Visibility (Should be TRUE)
        console.log('\n🔍 Checking visibility (Expect: FOUND)...');
        const res2 = await axios.get(CUSTOMER_API);
        const found2 = res2.data.data.find(r => r.name === regData.restaurant.name);

        if (found2) {
            console.log('✅ SUCCESS: Approved restaurant IS visible.');
        } else {
            console.error('❌ FAILURE: Approved restaurant is NOT visible!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        process.exit();
    }
};

runVerification();
