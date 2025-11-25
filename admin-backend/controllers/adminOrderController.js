import mongoose from 'mongoose';

let customerDB;

const getCustomerDB = async () => {
  if (!customerDB) {
    customerDB = mongoose.createConnection(process.env.MONGO_URI);
    await customerDB.asPromise();
  }
  return customerDB;
};

// @desc    Get orders grouped by restaurant
// @route   GET /api/admin/orders/by-restaurant
// @access  Private
export const getOrdersByRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    console.log('Fetching orders grouped by restaurant...');

    // First, let's check what fields exist in orders
    const sampleOrder = await ordersCollection.findOne({});
    console.log('Sample order structure:', JSON.stringify(sampleOrder, null, 2));

    // Aggregate orders by restaurant with flexible field matching
    const restaurantOrders = await ordersCollection.aggregate([
      {
        $group: {
          _id: '$restaurant',
          restaurantName: { $first: '$restaurantName' },
          totalOrders: { $sum: 1 },

          // Pending orders - match multiple possible statuses
          pendingOrders: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['Pending', 'Confirmed', 'Preparing', 'Accepted', 'Out for Delivery']
                  ]
                },
                1,
                0
              ]
            }
          },

          // Completed orders
          completedOrders: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Delivered'] },
                1,
                0
              ]
            }
          },

          // Cancelled orders
          cancelledOrders: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Cancelled', 'Rejected']]
                },
                1,
                0
              ]
            }
          },

          // Total revenue - Sum all orders except Cancelled/Rejected
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $not: [
                    {
                      $in: ['$status', ['Cancelled', 'Rejected']]
                    }
                  ]
                },
                {
                  $ifNull: [
                    '$total',
                    { $ifNull: ['$totalAmount', { $ifNull: ['$amount', 0] }] }
                  ]
                },
                0
              ]
            }
          },

          // Last order date
          lastOrderDate: { $max: { $ifNull: ['$createdAt', '$orderTime'] } }
        }
      },
      {
        $sort: { totalOrders: -1 }
      }
    ]).toArray();

    console.log(`Found ${restaurantOrders.length} restaurants with orders`);

    // Log revenue details for debugging
    restaurantOrders.forEach(r => {
      console.log(`${r.restaurantName}: Total=${r.totalOrders}, Completed=${r.completedOrders}, Revenue=₹${r.totalRevenue}`);
    });

    res.status(200).json({
      success: true,
      data: restaurantOrders,
      count: restaurantOrders.length
    });
  } catch (error) {
    console.error('Get orders by restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders by restaurant',
      error: error.message
    });
  }
};

// @desc    Debug - Get sample order structure
// @route   GET /api/admin/orders/debug/sample
// @access  Private
export const getSampleOrder = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    // Get one order of each status
    const statuses = ['Pending', 'Delivered', 'Cancelled', 'Out for Delivery', 'OutForDelivery'];
    const samples = {};

    for (const status of statuses) {
      const order = await ordersCollection.findOne({ status });
      if (order) {
        samples[status] = {
          _id: order._id,
          status: order.status,
          total: order.total,
          totalAmount: order.totalAmount,
          amount: order.amount,
          paymentStatus: order.paymentStatus,
          restaurant: order.restaurant,
          restaurantName: order.restaurantName,
          createdAt: order.createdAt,
          orderTime: order.orderTime
        };
      }
    }

    // Also get aggregated status list
    const statusList = await ordersCollection.distinct('status');

    res.status(200).json({
      success: true,
      availableStatuses: statusList,
      sampleOrders: samples,
      message: 'Check the actual field names and status values in your orders'
    });
  } catch (error) {
    console.error('Get sample order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sample order'
    });
  }
};


// @desc    Get orders for specific restaurant
// @route   GET /api/admin/orders/restaurant/:restaurantId
// @access  Private
export const getOrdersByRestaurantId = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    const restaurantId = req.params.restaurantId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';

    // Build query
    let query = { restaurant: new mongoose.Types.ObjectId(restaurantId) };
    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      ordersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      ordersCollection.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get orders by restaurant ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant orders'
    });
  }
};

// @desc    Get all orders (original function - keep for backward compatibility)
// @route   GET /api/admin/orders
// @access  Private
export const getAllOrders = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { restaurantName: { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      ordersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      ordersCollection.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');
    const usersCollection = customerConn.collection('users');

    const orderId = new mongoose.Types.ObjectId(req.params.id);

    const order = await ordersCollection.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    let customer = null;
    if (order.customer) {
      customer = await usersCollection.findOne(
        { _id: order.customer },
        { projection: { password: 0 } }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        order,
        customer
      }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    const orderId = new mongoose.Types.ObjectId(req.params.id);
    const { status, notes } = req.body;

    const validStatuses = [
      'Pending', 'Accepted', 'Rejected', 'Confirmed',
      'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updateData = {
      status,
      updatedAt: new Date(),
      adminUpdated: true,
      adminNotes: notes || ''
    };

    const result = await ordersCollection.findOneAndUpdate(
      { _id: orderId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    const orderId = new mongoose.Types.ObjectId(req.params.id);
    const { reason } = req.body;

    const result = await ordersCollection.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: 'Cancelled',
          cancellationReason: reason || 'Cancelled by admin',
          cancelledAt: new Date(),
          cancelledBy: 'Admin',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: result.value
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private
export const getOrderStats = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const ordersCollection = customerConn.collection('orders');

    const stats = await ordersCollection.aggregate([
      {
        $facet: {
          statusCount: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          revenueByStatus: [
            {
              $group: {
                _id: '$status',
                revenue: { $sum: '$total' }
              }
            }
          ],
          dailyOrders: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]).toArray();

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
};
