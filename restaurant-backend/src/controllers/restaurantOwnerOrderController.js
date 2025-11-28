import { Order } from '../models/Order.js';
import { findRestaurantByOwner, Restaurant } from '../models/Restaurant.js';
import mongoose from 'mongoose';
import axios from 'axios';

const ALLOWED_STATUSES = [
  'Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery', 'Cancelled'
];

const STATUS_TRANSITIONS = {  // Updated for lowercase
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out-for-delivery', 'cancelled'],
  outForDelivery: [],
  cancelled: []
};

// Helper (fixed)
// Helper - Look in BOTH collections
const getRestaurantId = async (restaurantOwnerId) => {
  console.log('🔍 Looking for restaurant with owner:', restaurantOwnerId);

  const restaurant = await findRestaurantByOwner(restaurantOwnerId);

  if (restaurant) {
    console.log('✅ Found restaurant:', restaurant._id);
    return restaurant._id;
  }

  console.log('❌ Restaurant not found for owner:', restaurantOwnerId);
  return null;
};

// GET /api/orders
export const getRestaurantOwnerOrders = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;

    console.log('🔍 Fetching orders for restaurant owner:', restaurantOwnerId);

    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      console.log('❌ No restaurant found for owner');
      return res.json({
        success: true,
        data: { orders: [], pagination: { currentPage: 1, totalPages: 0, totalOrders: 0 } },
        message: 'No restaurant – no orders available. Create your store first.'
      });
    }

    console.log('✅ Restaurant ID:', restaurantId);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // ✅ FIXED: Access orders collection directly to avoid model issues
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    // Convert restaurantId to ObjectId for query
    const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);

    const totalOrders = await ordersCollection.countDocuments({
      restaurant: restaurantObjectId
    });

    console.log('📊 Total orders found:', totalOrders);

    const orders = await ordersCollection
      .find({ restaurant: restaurantObjectId })
      .sort({ createdAt: -1, orderTime: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log('✅ Retrieved', orders.length, 'orders');

    const totalPages = Math.ceil(totalOrders / limit);

    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ getRestaurantOwnerOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// PUT /api/orders/:id/status
export const updateRestaurantOwnerOrderStatus = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { id } = req.params;
    let { status } = req.body;

    console.log('📝 Updating order status:', { orderId: id, newStatus: status });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // ✅ FIXED: Normalize status to match frontend format (capitalize first letter)
    const normalizeStatus = (s) => {
      if (!s) return '';
      // Handle special cases
      if (s.toLowerCase() === 'outfordelivery' || s.toLowerCase() === 'out-for-delivery') {
        return 'OutForDelivery';
      }
      // Capitalize first letter
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    };

    status = normalizeStatus(status);

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      console.log('❌ Invalid status:', status);
      console.log('   Allowed:', ALLOWED_STATUSES);
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const restaurantId = await getRestaurantId(restaurantOwnerId);
    if (!restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'No restaurant found for this owner'
      });
    }

    // ✅ FIXED: Update order directly in collection
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    const updateResult = await ordersCollection.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        restaurant: new mongoose.Types.ObjectId(restaurantId)
      },
      {
        $set: {
          status: status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    // ✅ FIXED: Handle MongoDB driver return value (it returns the doc directly in newer versions)
    const updatedOrder = updateResult.value || updateResult;

    if (!updatedOrder || !updatedOrder._id) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this restaurant'
      });
    }

    console.log('✅ Order status updated successfully to:', status);

    // Retrieve the updated order to get originalOrderId
    const remoteOrderId = updatedOrder.originalOrderId;

    // ✅ NEW: Trigger Delivery Order Creation if status is 'Ready'
    if (status === 'Ready') {
      try {
        console.log('🚀 Status is Ready - Initiating Delivery Order Creation...');

        // 1. Get Restaurant Details for Location
        const restaurantDetails = await Restaurant.findById(restaurantId);

        if (!restaurantDetails) {
          console.error('❌ Critical: Restaurant details not found for delivery creation');
        } else {
          const DELIVERY_BACKEND_URL = process.env.DELIVERY_BACKEND_URL || 'http://localhost:5003';

          // 2. Construct Payload
          const deliveryPayload = {
            orderId: updatedOrder.originalOrderId || updatedOrder._id.toString(), // Prefer original ID
            orderNumber: updatedOrder.orderNumber,
            restaurant: restaurantId,
            restaurantName: restaurantDetails.name,
            restaurantLocation: restaurantDetails.location, // { address, coordinates }
            customer: updatedOrder.userId, // Customer ID
            customerName: updatedOrder.customerName || 'Customer',
            customerPhone: updatedOrder.customerPhone || '',
            deliveryAddress: updatedOrder.deliveryAddress, // Now an object
            orderAmount: updatedOrder.totalAmount,
            deliveryFee: updatedOrder.deliveryFee || 0,
            distance: updatedOrder.deliveryDistance || 0,
            estimatedDeliveryTime: 30 // Default or calculate
          };

          console.log('📦 Sending payload to Delivery Backend:', JSON.stringify(deliveryPayload, null, 2));

          // 3. Call Delivery Backend
          const deliveryResponse = await axios.post(
            `${DELIVERY_BACKEND_URL}/api/delivery/orders/create`,
            deliveryPayload,
            { timeout: 5000 }
          );

          if (deliveryResponse.data.success) {
            console.log('✅✅✅ Delivery Order Created Successfully!');
          } else {
            console.warn('⚠️ Delivery Backend returned success: false', deliveryResponse.data);
          }
        }
      } catch (deliveryError) {
        console.error('❌ Failed to create delivery order:', deliveryError.message);
        if (deliveryError.response) {
          console.error('   Response data:', deliveryError.response.data);
        }
      }
    }

    if (!remoteOrderId) {
      console.warn('⚠️ No originalOrderId found for order. Cannot sync to customer-backend correctly.');
      // We might still try with 'id' but it will likely fail if IDs are different.
      // For now, we proceed but log the warning.
    }

    // ✅ Sync status update to customer-backend
    // This is crucial for 'Ready' status to trigger delivery notification!
    try {
      const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'http://localhost:5000';
      const targetId = remoteOrderId || id;

      console.log(`📡 Syncing status '${status}' to customer-backend for order ${targetId}...`);

      const syncResponse = await axios.put(
        `${CUSTOMER_BACKEND_URL}/api/orders/${targetId}/update-status`,
        { status: status },
        { timeout: 5000 }
      );

      if (syncResponse.data.success) {
        console.log('✅ Status synced to customer-backend - delivery notification should be triggered!');
      } else {
        console.warn('⚠️ Customer-backend sync returned success: false');
      }
    } catch (syncError) {
      console.error('⚠️ Failed to sync status to customer-backend:', syncError.message);
      // Don't fail the request if sync fails - the local update succeeded
    }

    return res.json({
      success: true,
      data: updateResult.value,
      message: 'Order status updated'
    });
  } catch (error) {
    console.error('❌ updateRestaurantOwnerOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// GET /api/orders/:id
export const getRestaurantOwnerOrderById = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const restaurantId = await getRestaurantId(restaurantOwnerId);
    if (!restaurantId) {
      return res.json({ success: true, data: null, message: 'No restaurant – order unavailable' });
    }

    // ✅ FIXED: Access orders collection directly
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');

    const order = await ordersCollection.findOne({
      _id: new mongoose.Types.ObjectId(id),
      restaurant: new mongoose.Types.ObjectId(restaurantId)
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this restaurant' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('getRestaurantOwnerOrderById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// ✅ NEW: Receive order from customer backend
export const receiveOrderFromCustomer = async (req, res) => {
  try {
    const {
      orderId,
      orderNumber,
      customerId,
      customerName,
      customerPhone,
      restaurantId,
      items,
      deliveryAddress,
      subtotal,
      deliveryFee,
      taxes,
      total,
      paymentMethod,
      instructions,
      orderTime
    } = req.body;

    console.log('🔔 Received order from customer backend:', orderNumber);
    console.log('📍 Restaurant ID:', restaurantId);

    // Validation
    if (!restaurantId || !orderNumber || !items) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.error('❌ Restaurant not found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Create order in RESTAURANT database
    const restaurantOrder = new Order({
      userId: customerId,
      restaurant: restaurantId,
      orderNumber: orderNumber,
      originalOrderId: orderId, // ✅ Save original order ID
      items: items.map(item => ({
        menuItemId: item.menuItem || null,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: total,
      paymentMethod: paymentMethod.toLowerCase(),
      status: 'pending', // lowercase to match enum
      // ✅ CHANGED: Save full address object and fee
      deliveryAddress: deliveryAddress,
      deliveryFee: deliveryFee || 0,
      deliveryDistance: 0, // Default as not sent by customer-backend yet
      notes: instructions || '',
      customerName: customerName || 'Customer', // ✅ Default to 'Customer' if missing
      customerPhone: customerPhone || ''
    });

    await restaurantOrder.save();
    console.log('✅ Order saved in restaurant database:', restaurantOrder._id);

    // ✅ SOCKET.IO: Notify restaurant owner immediately
    if (req.io) {
      const roomName = `restaurant_${restaurantId}`;
      console.log(`📡 Emitting 'new_order' to room: ${roomName}`);
      req.io.to(roomName).emit('new_order', {
        _id: restaurantOrder._id,
        orderNumber: orderNumber,
        customerName: customerName || 'Customer',
        totalAmount: total,
        items: items,
        status: 'Pending',
        createdAt: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order received successfully',
      data: {
        orderId: restaurantOrder._id,
        orderNumber: orderNumber
      }
    });
  } catch (error) {
    console.error('❌ Receive order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to receive order',
      error: error.message
    });
  }
};

// ✅ NEW: Accept order endpoint
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantOwnerId = req.restaurantOwner.id;

    console.log('✅ Restaurant accepting order:', id);

    // Fetch order to get originalOrderId
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const targetId = order.originalOrderId || id;

    // Update order status in customer backend
    const updateResponse = await axios.put(
      `http://localhost:5000/api/orders/${targetId}/update-status`,
      {
        status: 'Accepted',
        acceptedAt: new Date()
      },
      { timeout: 5000 }
    );

    if (updateResponse.data.success) {
      console.log('✅ Order status updated in Customer DB');

      res.json({
        success: true,
        message: 'Order accepted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  } catch (error) {
    console.error('acceptOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order'
    });
  }
};

// ✅ NEW: Reject order endpoint
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('❌ Restaurant rejecting order:', id);

    // Fetch order to get originalOrderId
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const targetId = order.originalOrderId || id;

    const updateResponse = await axios.put(
      `http://localhost:5000/api/orders/${targetId}/update-status`,
      {
        status: 'Rejected',
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { timeout: 5000 }
    );

    if (updateResponse.data.success) {
      console.log('✅ Order rejection updated in Customer DB');

      res.json({
        success: true,
        message: 'Order rejected'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  } catch (error) {
    console.error('rejectOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject order'
    });
  }
};
