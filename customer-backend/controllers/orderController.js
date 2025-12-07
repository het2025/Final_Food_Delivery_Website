import Order from '../models/Order.js';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      restaurantName,
      restaurantImage,
      restaurant,
      deliveryAddress,
      subtotal,
      deliveryFee,
      taxes,
      discount,
      total,
      paymentMethod,
      instructions,
      estimatedDeliveryTime,
      deliveryDistance,
      deliveryDuration
    } = req.body;

    const customerId = req.user._id;

    console.log('🔔 Creating order for customer:', customerId);
    console.log('📦 Restaurant ID:', restaurant);

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID is required'
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery address is required'
      });
    }

    // Generate unique order number
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderNumber = `ORD-${date}-${random}`;

    // ✅ FIXED: Create order with STRING customization
    const order = new Order({
      customer: customerId,
      items: items.map(item => {
        // ✅ Ensure customization is STRING or empty string
        let customizationStr = '';
        if (item.customization) {
          if (Array.isArray(item.customization)) {
            customizationStr = item.customization.join(', ');
          } else if (typeof item.customization === 'object') {
            customizationStr = JSON.stringify(item.customization);
          } else {
            customizationStr = String(item.customization);
          }
        }

        return {
          menuItem: item.menuItem || null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || 'placeholder.jpg',
          customization: customizationStr // ✅ Always STRING
        };
      }),
      restaurant: restaurant,
      restaurantName: restaurantName,
      restaurantImage: restaurantImage || 'placeholder.jpg',
      deliveryAddress: deliveryAddress,
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      taxes: taxes || 0,
      discount: discount || 0,
      total: total || 0,
      paymentMethod: paymentMethod || 'COD',
      instructions: instructions || '',
      estimatedDeliveryTime: estimatedDeliveryTime || new Date(Date.now() + 30 * 60000),
      deliveryDistance: deliveryDistance || 0,
      deliveryDuration: deliveryDuration || 30,
      status: 'Pending',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderNumber: orderNumber
    });

    await order.save();
    console.log('✅ Order created successfully:', order._id);

    // Increment completedOrdersCount for the user (new definition of 'completed')
    const user = await User.findById(customerId);
    if (user) {
      user.completedOrdersCount = (user.completedOrdersCount || 0) + 1;
      await user.save();
      console.log(`User ${user._id} completed orders count incremented to ${user.completedOrdersCount} after order creation.`);
    }

    // Send order to Restaurant Backend
    const RESTAURANT_BACKEND_URL = process.env.RESTAURANT_BACKEND_URL || 'http://localhost:5001';

    try {
      await axios.post(`${RESTAURANT_BACKEND_URL}/api/orders/receive`, {
        orderId: order._id.toString(),
        orderNumber: orderNumber,
        customerId: customerId.toString(),
        customerName: req.user.name || 'Customer',
        customerPhone: req.user.phone || '',
        restaurantId: restaurant,
        items: items,
        deliveryAddress: deliveryAddress,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        taxes: taxes,
        total: total,
        paymentMethod: paymentMethod,
        instructions: instructions,
        orderTime: new Date()
      });

      console.log('✅ Order notification sent to restaurant backend');
    } catch (notifyError) {
      console.error('⚠️ Failed to notify restaurant:', notifyError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Create order error:', error);

    let errorMessage = 'Error creating order';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(e => e.message).join(', ');
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};



// Get all orders for logged-in customer
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { status, limit = 20, page = 1 } = req.query;

    const query = { customer: customerId };
    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .sort({ orderTime: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order details
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const customerId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const customerId = req.user.id;

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'This order cannot be cancelled'
      });
    }

    order.status = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.cancelledAt = new Date();
    order.cancelledBy = 'Customer';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Add rating and review
export const rateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, review } = req.body;
    const customerId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      customer: customerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    order.rating = rating;
    order.review = review || '';
    order.reviewDate = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: order
    });

  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
};

// Update order status (called by restaurant backend)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, acceptedAt, rejectedAt, rejectionReason } = req.body;

    const updateData = { status };
    if (acceptedAt) updateData.acceptedAt = acceptedAt;
    if (rejectedAt) updateData.rejectedAt = rejectedAt;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    const oldOrder = await Order.findById(id);

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Emit socket event to the order room
    if (req.io) {
      req.io.to(`order_${id}`).emit('orderStatusUpdated', {
        orderId: id,
        status,
        updatedOrder: order
      });
      console.log(`📡 Emitted orderStatusUpdated for order ${id}: ${status}`);
    }

    // If order status is 'Ready', notify delivery-backend to create DeliveryOrder
    if (status === 'Ready' && oldOrder && oldOrder.status !== 'Ready') {
      try {
        const DELIVERY_BACKEND_URL = process.env.DELIVERY_BACKEND_URL || 'http://localhost:5003';

        const deliveryOrderData = {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          restaurant: order.restaurant,
          restaurantName: order.restaurantName,
          restaurantLocation: {
            address: order.restaurantAddress || '',
            coordinates: []
          },
          customer: order.customer,
          customerName: order.customerName || 'Customer',
          customerPhone: order.customerPhone || '',
          deliveryAddress: order.deliveryAddress,
          orderAmount: order.total,
          deliveryFee: order.deliveryFee || 0,
          distance: order.deliveryDistance || 0,
          estimatedDeliveryTime: order.estimatedDeliveryTime || 30
        };

        console.log('📦 Notifying delivery-backend about Ready order:', order.orderNumber);

        const deliveryResponse = await axios.post(
          `${DELIVERY_BACKEND_URL}/api/delivery/orders/create`,
          deliveryOrderData,
          { timeout: 5000 }
        );

        if (deliveryResponse.data.success) {
          console.log('✅ Delivery order created in delivery-backend');
        }
      } catch (deliveryError) {
        console.error('⚠️ Failed to create delivery order:', deliveryError.message);
        // Don't fail the status update if delivery notification fails
      }
    }

    // ✅ NEW: Sync status to Restaurant Backend (e.g. Delivered)
    if (['Delivered', 'OutForDelivery', 'Out for Delivery'].includes(status)) {
      try {
        const RESTAURANT_BACKEND_URL = process.env.RESTAURANT_BACKEND_URL || 'http://localhost:5001';

        console.log(`📡 Syncing status '${status}' to restaurant-backend...`);

        await axios.put(`${RESTAURANT_BACKEND_URL}/api/orders/receive-status-update`, {
          orderId: order._id.toString(),
          status: status
        });

        console.log('✅ Status synced to restaurant-backend');
      } catch (syncError) {
        console.error('⚠️ Failed to sync status to restaurant-backend:', syncError.message);
      }
    }

    res.json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Validate coupon code
export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;
    const userId = req.user._id; // Get current user ID
    const user = await User.findById(userId); // Fetch user to get completedOrdersCount

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const completedOrdersCount = user.completedOrdersCount || 0;

    if (!couponCode || subtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and subtotal are required.'
      });
    }

    // --- Hardcoded list of static coupons ---
    let coupons = [
      {
        code: 'PIZZA50',
        type: 'percentage',
        value: 50,
        description: '50% off your next pizza',
        minSpend: 0,
        unlocked: true // Always available
      },
      {
        code: 'WEEKENDTREAT',
        type: 'free_delivery',
        value: 0, // Value is not used for free delivery
        description: 'Free delivery on all orders',
        minSpend: 200,
        unlocked: true // Always available
      },
      {
        code: 'BIRYANI100',
        type: 'fixed',
        value: 100,
        description: '₹100 off on Biryani',
        minSpend: 300,
        unlocked: true // Always available
      },
      {
        code: 'FEAST150',
        type: 'fixed',
        value: 150,
        description: 'Flat ₹150 off',
        minSpend: 599,
        unlocked: true // Always available
      },
      {
        code: 'WALLET20',
        type: 'percentage',
        value: 20,
        description: '20% cashback on wallet payment',
        minSpend: 0,
        unlocked: true // Always available
      }
    ];

    // --- Dynamic Rewards Coupons based on completed orders ---
    const dynamicRewardsTiers = [
      { orders: 5, discount: 20, code: 'ORDER20-5', description: '20% off on your next order!', minSpend: 0 },
      { orders: 10, discount: 25, code: 'ORDER25-10', description: '25% off on your next order!', minSpend: 0 },
      { orders: 15, discount: 30, code: 'ORDER30-15', description: '30% off on your next order!', minSpend: 0 },
      { orders: 20, discount: 35, code: 'ORDER35-20', description: '35% off on your next order!', minSpend: 0 },
      { orders: 30, discount: 40, code: 'ORDER40-30', description: '40% off on your next order!', minSpend: 0 },
      { orders: 40, discount: 50, code: 'ORDER50-40', description: '50% off on your next order!', minSpend: 0 },
    ];

    dynamicRewardsTiers.forEach(tier => {
      // Check if user has completed enough orders to unlock this tier
      if (completedOrdersCount >= tier.orders) {
        coupons.push({
          code: tier.code,
          type: 'percentage',
          value: tier.discount,
          description: tier.description,
          minSpend: tier.minSpend,
          unlocked: true,
          unlockedByOrders: tier.orders // Track which order count unlocked it
        });
      }
    });

    const coupon = coupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code.'
      });
    }

    if (subtotal < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum spend of ₹${coupon.minSpend}.`
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }
    // For 'free_delivery', the discount is handled separately on the frontend,
    // but we can return the coupon type to inform the UI.

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        discountAmount: discountAmount,
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating coupon',
      error: error.message
    });
  }
};

// Get all orders with status 'Ready' (Internal use for Delivery Backend)
export const getReadyOrders = async (req, res) => {
  try {
    // In a real app, you should verify this request comes from a trusted service (e.g. via API Key)
    const orders = await Order.find({ status: 'Ready' })
      .populate('restaurant', 'name location address') // Populate restaurant details
      .populate('customer', 'name phone') // Populate customer details
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get ready orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ready orders',
      error: error.message
    });
  }
};
