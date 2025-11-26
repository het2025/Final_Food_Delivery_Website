const axios = require('axios');

const testDeliveryOrderCreation = async () => {
    try {
        console.log('🧪 Testing Delivery Order Creation\n');

        const DELIVERY_BACKEND = 'http://localhost:5003';

        const testOrderData = {
            orderId: '507f1f77bcf86cd799439011', // Mock MongoDB ObjectId
            orderNumber: 'TEST-20251126-001',
            restaurant: '507f1f77bcf86cd799439012',
            restaurantName: 'Test Restaurant',
            restaurantLocation: {
                address: '123 Test St',
                coordinates: [72.5, 23.0]
            },
            customer: '507f1f77bcf86cd799439013',
            customerName: 'Test Customer',
            customerPhone: '9876543210',
            deliveryAddress: {
                street: '456 Customer St',
                city: 'Test City',
                state: 'Test State',
                pincode: '123456'
            },
            orderAmount: 500,
            deliveryFee: 30,
            distance: 5,
            estimatedDeliveryTime: 30
        };

        console.log('Sending request to:', `${DELIVERY_BACKEND}/api/delivery/orders/create`);
        console.log('Payload:', JSON.stringify(testOrderData, null, 2));

        const response = await axios.post(
            `${DELIVERY_BACKEND}/api/delivery/orders/create`,
            testOrderData,
            {
                timeout: 10000,
                validateStatus: () => true // Accept any status code
            }
        );

        console.log('\n📬 Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('\n✅ SUCCESS! Delivery order created.');
            console.log('Delivery Order ID:', response.data.data._id);
        } else {
            console.log('\n❌ FAILED! Delivery order not created.');
            console.log('Message:', response.data.message);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Delivery backend is not running on port 5003!');
        } else if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

testDeliveryOrderCreation();
