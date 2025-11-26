const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const DELIVERY_BACKEND = 'http://localhost:5003';

const checkAndCreateDeliveryOrders = async () => {
    try {
        console.log('🔍 Checking for missing delivery orders...\n');

        const conn = await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        // 1. Find all "Ready" orders
        const ordersCollection = db.collection('orders');
        const readyOrders = await ordersCollection.find({ status: 'Ready' }).toArray();
        console.log(`📦 Found ${readyOrders.length} orders with status 'Ready'`);

        if (readyOrders.length === 0) {
            console.log('💡 No Ready orders found. Create an order and mark it Ready first.\n');
            process.exit(0);
        }

        // 2. Find existing delivery orders
        const deliveryOrdersCollection = db.collection('delivery_orders');
        const existingDeliveryOrders = await deliveryOrdersCollection.find({}).toArray();
        const existingOrderIds = new Set(existingDeliveryOrders.map(d => d.orderId));

        console.log(`🚚 Found ${existingDeliveryOrders.length} delivery orders`);
        console.log(`   ready_for_pickup: ${existingDeliveryOrders.filter(d => d.status === 'ready_for_pickup').length}`);
        console.log(`   accepted: ${existingDeliveryOrders.filter(d => d.status === 'accepted').length}`);
        console.log(`   picked_up: ${existingDeliveryOrders.filter(d => d.status === 'picked_up').length}`);
        console.log(`   delivered: ${existingDeliveryOrders.filter(d => d.status === 'delivered').length}\n`);

        // 3. Find missing delivery orders
        const missingOrders = readyOrders.filter(order =>
            !existingOrderIds.has(order._id.toString())
        );

        console.log(`❌ Missing delivery orders: ${missingOrders.length}\n`);

        if (missingOrders.length === 0) {
            console.log('✅ All Ready orders have delivery orders. System is working correctly!');
            process.exit(0);
        }

        // 4. Create missing delivery orders
        console.log('🔧 Creating missing delivery orders...\n');

        for (const order of missingOrders) {
            console.log(`Creating delivery order for: ${order.orderNumber}`);

            try {
                const deliveryOrderData = {
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber,
                    restaurant: order.restaurant,
                    restaurantName: order.restaurantName || 'Restaurant',
                    restaurantLocation: { address: '', coordinates: [] },
                    customer: order.customer,
                    customerName: order.customerName || 'Customer',
                    customerPhone: order.customerPhone || '',
                    deliveryAddress: order.deliveryAddress,
                    orderAmount: order.total || 0,
                    deliveryFee: order.deliveryFee || 30,
                    distance: order.deliveryDistance || 5,
                    estimatedDeliveryTime: 30
                };

                const response = await axios.post(
                    `${DELIVERY_BACKEND}/api/delivery/orders/create`,
                    deliveryOrderData,
                    { timeout: 5000 }
                );

                if (response.data.success) {
                    console.log(`  ✅ Created delivery order ${response.data.data._id}`);
                } else {
                    console.log(`  ❌ Failed: ${response.data.message}`);
                }
            } catch (createError) {
                console.log(`  ❌ Error: ${createError.message}`);
            }
        }

        console.log('\n✅ Repair complete! Check delivery-frontend now.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
};

checkAndCreateDeliveryOrders();
