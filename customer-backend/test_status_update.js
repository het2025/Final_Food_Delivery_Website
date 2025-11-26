const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const testStatusUpdate = async () => {
    try {
        console.log('🧪 Testing Customer-Backend Status Update\n');

        // Connect to DB to get an actual order
        const conn = await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Find any order that's not already Ready
        const testOrder = await ordersCollection.findOne({
            status: { $nin: ['Ready', 'Delivered', 'Cancelled'] }
        });

        if (!testOrder) {
            console.log('❌ No suitable test order found');
            console.log('💡 Create an order from customer side first');
            process.exit(0);
        }

        console.log(`Found test order: ${testOrder.orderNumber}`);
        console.log(`  Current status: ${testOrder.status}`);
        console.log(`  Order ID: ${testOrder._id}\n`);

        // Try to update status to Ready
        const CUSTOMER_BACKEND = 'http://localhost:5000';
        const updateUrl = `${CUSTOMER_BACKEND}/api/orders/${testOrder._id}/update-status`;

        console.log(`Calling: PUT ${updateUrl}`);
        console.log(`Payload: { status: 'Ready' }\n`);

        const response = await axios.put(
            updateUrl,
            { status: 'Ready' },
            {
                timeout: 10000,
                validateStatus: () => true
            }
        );

        console.log('📬 Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('\n✅ Status update successful!');
            console.log('Now checking if delivery order was created...\n');

            // Wait a moment for delivery order creation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check delivery_orders collection
            const deliveryOrdersCollection = db.collection('delivery_orders');
            const deliveryOrder = await deliveryOrdersCollection.findOne({
                orderId: testOrder._id.toString()
            });

            if (deliveryOrder) {
                console.log('✅ SUCCESS! Delivery order was created!');
                console.log(`   Delivery Order ID: ${deliveryOrder._id}`);
                console.log(`   Status: ${deliveryOrder.status}`);
            } else {
                console.log('❌ PROBLEM: Delivery order was NOT created');
                console.log('💡 Check customer-backend logs for errors in delivery order creation');
            }
        } else {
            console.log('\n❌ Status update failed');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        process.exit();
    }
};

testStatusUpdate();
