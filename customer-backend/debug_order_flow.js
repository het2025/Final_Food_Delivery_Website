const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const CUSTOMER_BACKEND = 'http://localhost:5000';
const DELIVERY_BACKEND = 'http://localhost:5003';

const debugOrderFlow = async () => {
    try {
        console.log('🔍 DEBUGGING ORDER READY FLOW\n');

        // Step 1: Check if there are any "Ready" orders in customer-backend
        console.log('Step 1: Checking for Ready orders in customer database...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        const readyOrders = await ordersCollection.find({ status: 'Ready' }).toArray();
        console.log(`Found ${readyOrders.length} orders with status 'Ready'`);

        if (readyOrders.length === 0) {
            console.log('❌ No Ready orders found. Create an order and mark it Ready first.\n');
            process.exit(0);
        }

        // Show first ready order
        const testOrder = readyOrders[0];
        console.log(`\nTest Order: ${testOrder.orderNumber}`);
        console.log(`  Order ID: ${testOrder._id}`);
        console.log(`  Status: ${testOrder.status}`);
        console.log(`  Restaurant: ${testOrder.restaurant}`);

        // Step 2: Check if delivery order exists
        console.log('\nStep 2: Checking if delivery order exists...');
        try {
            const deliveryCheckResponse = await axios.get(
                `${DELIVERY_BACKEND}/api/delivery/orders/available`,
                {
                    headers: {
                        'Authorization': 'Bearer test-token' // This might fail auth, but we'll see the response
                    }
                }
            );
            console.log(`✅ Delivery backend is reachable`);
            console.log(`   Available orders: ${deliveryCheckResponse.data.count || 0}`);
        } catch (deliveryError) {
            if (deliveryError.response?.status === 401) {
                console.log('⚠️ Delivery backend requires auth (expected)');
            } else {
                console.error('❌ Delivery backend error:', deliveryError.message);
            }
        }

        // Step 3: Check delivery_orders collection directly
        console.log('\nStep 3: Checking delivery_orders collection...');
        const deliveryOrdersCollection = db.collection('delivery_orders');
        const deliveryOrders = await deliveryOrdersCollection.find({}).toArray();
        console.log(`Found ${deliveryOrders.length} delivery orders total`);

        const readyDeliveryOrders = await deliveryOrdersCollection.find({
            status: 'ready_for_pickup'
        }).toArray();
        console.log(`Found ${readyDeliveryOrders.length} delivery orders with status 'ready_for_pickup'`);

        // Step 4: Try to manually trigger delivery order creation
        console.log('\nStep 4: Manually triggering delivery order creation for test order...');
        try {
            const createResponse = await axios.post(
                `${DELIVERY_BACKEND}/api/delivery/orders/create`,
                {
                    orderId: testOrder._id.toString(),
                    orderNumber: testOrder.orderNumber,
                    restaurant: testOrder.restaurant,
                    restaurantName: testOrder.restaurantName || 'Test Restaurant',
                    restaurantLocation: { address: '', coordinates: [] },
                    customer: testOrder.customer,
                    customerName: testOrder.customerName || 'Customer',
                    customerPhone: testOrder.customerPhone || '',
                    deliveryAddress: testOrder.deliveryAddress,
                    orderAmount: testOrder.total || 0,
                    deliveryFee: testOrder.deliveryFee || 30,
                    distance: testOrder.deliveryDistance || 5,
                    estimatedDeliveryTime: 30
                },
                { timeout: 5000 }
            );

            if (createResponse.data.success) {
                console.log('✅ Delivery order created successfully!');
                console.log(`   Delivery Order ID: ${createResponse.data.data._id}`);
            } else {
                console.log('⚠️ Create delivery order returned success: false');
                console.log('   Message:', createResponse.data.message);
            }
        } catch (createError) {
            console.error('❌ Failed to create delivery order:');
            if (createError.response) {
                console.error('   Status:', createError.response.status);
                console.error('   Data:', JSON.stringify(createError.response.data, null, 2));
            } else {
                console.error('   Error:', createError.message);
            }
        }

        // Step 5: Check again
        console.log('\nStep 5: Checking delivery orders again...');
        const finalDeliveryOrders = await deliveryOrdersCollection.find({
            status: 'ready_for_pickup'
        }).toArray();
        console.log(`Now have ${finalDeliveryOrders.length} ready_for_pickup orders`);

        if (finalDeliveryOrders.length > 0) {
            console.log('\n✅ SUCCESS! Delivery orders are now available.');
        } else {
            console.log('\n❌ PROBLEM: Still no delivery orders available.');
        }

    } catch (error) {
        console.error('❌ Debug error:', error.message);
    } finally {
        process.exit();
    }
};

debugOrderFlow();
