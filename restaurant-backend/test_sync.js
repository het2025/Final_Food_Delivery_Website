const axios = require('axios');
const mongoose = require('mongoose');

const testRestaurantToCustomerSync = async () => {
    try {
        console.log('🧪 Testing Restaurant → Customer Status Sync\n');

        // Connect to get an actual order
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://het123:het123@cluster0.7k1dq1j.mongodb.net/quickbite?retryWrites=true&w=majority&appName=Cluster0');

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Find an order to test with
        const testOrder = await ordersCollection.findOne({
            status: { $in: ['Pending', 'Accepted', 'Preparing'] }
        });

        if (!testOrder) {
            console.log('❌ No suitable test order found');
            console.log('💡 Create an order from customer side with status Pending/Accepted/Preparing');
            process.exit(0);
        }

        console.log(`Found order: ${testOrder.orderNumber}`);
        console.log(`  Current status: ${testOrder.status}`);
        console.log(`  Order ID: ${testOrder._id}\n`);

        // Simulate what restaurant-backend does
        const CUSTOMER_BACKEND_URL = 'http://localhost:5000';
        const orderId = testOrder._id.toString();
        const newStatus = 'Ready';

        console.log(`Simulating restaurant-backend sync:`);
        console.log(`  URL: ${CUSTOMER_BACKEND_URL}/api/orders/${orderId}/update-status`);
        console.log(`  Payload: { status: '${newStatus}' }\n`);

        try {
            const syncResponse = await axios.put(
                `${CUSTOMER_BACKEND_URL}/api/orders/${orderId}/update-status`,
                { status: newStatus },
                {
                    timeout: 10000,
                    validateStatus: () => true
                }
            );

            console.log('📬 Response Status:', syncResponse.status);
            console.log('Response Data:', JSON.stringify(syncResponse.data, null, 2));

            if (syncResponse.data.success) {
                console.log('\n✅ Customer-backend sync successful!');
                console.log('Now checking if delivery order was created...\n');

                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check if delivery order was created
                const deliveryOrdersCollection = db.collection('delivery_orders');
                const deliveryOrder = await deliveryOrdersCollection.findOne({
                    orderId: orderId
                });

                if (deliveryOrder) {
                    console.log('✅ SUCCESS! Delivery order created!');
                    console.log(`   ID: ${deliveryOrder._id}`);
                    console.log(`   Status: ${deliveryOrder.status}`);
                    console.log('\n💡 The system is working! New orders should appear in delivery-frontend.');
                } else {
                    console.log('❌ PROBLEM: Delivery order was NOT created');
                    console.log('💡 Check customer-backend logs for delivery creation errors');
                }
            } else {
                console.log('\n❌ Customer-backend sync failed');
                console.log('Error:', syncResponse.data.message);
            }

        } catch (syncError) {
            console.error('\n❌ Sync request failed:');
            if (syncError.code === 'ECONNREFUSED') {
                console.error('💡 Customer-backend is not running on port 5000!');
            } else if (syncError.response) {
                console.error('Status:', syncError.response.status);
                console.error('Data:', JSON.stringify(syncError.response.data, null, 2));
            } else {
                console.error('Error:', syncError.message);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
};

testRestaurantToCustomerSync();
