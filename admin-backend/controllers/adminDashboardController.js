import mongoose from 'mongoose';
import axios from 'axios';

// Create separate connections for customer and restaurant databases
let customerDB;
let restaurantDB;

const getCustomerDB = async () => {
  if (!customerDB) {
    customerDB = mongoose.createConnection(process.env.MONGO_URI);
    await customerDB.asPromise();
  }
  return customerDB;
};

const getRestaurantDB = async () => {
  if (!restaurantDB) {
    restaurantDB = mongoose.createConnection(process.env.MONGO_URI);
    await restaurantDB.asPromise();
  }
  return restaurantDB;
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantConn = await getRestaurantDB();

    // Ensure connections are ready
    if (customerConn.readyState !== 1) {
      await customerConn.asPromise();
    }
    if (restaurantConn.readyState !== 1) {
      await restaurantConn.asPromise();
    }

    // Get collections
    const usersCollection = customerConn.collection('users');
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('newregisteredrestaurants');
    const ordersCollection = customerConn.collection('orders');
    const restaurantOwnersCollection = restaurantConn.collection('restaurantowners');

    // Parallel queries for better performance
    const [
      totalUsers,
      totalRestaurants,
      newRegisteredRestaurants,
      totalOrders,
      totalRestaurantOwners,
      recentOrders,
      revenueData
    ] = await Promise.all([
      // Total users
      usersCollection.countDocuments({ role: 'customer' }),

      // Total active restaurants
      restaurantsCollection.countDocuments({ status: 'active', isActive: true }),

      // Newly registered restaurants (pending approval)
      newRestaurantsCollection.countDocuments({ isNewlyRegistered: true }),

      // Total orders
      ordersCollection.countDocuments({}),

      // Total restaurant owners
      restaurantOwnersCollection.countDocuments({ isActive: true }),

      // Recent 10 orders
      ordersCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),

      // Revenue calculation (sum of completed orders)
      ordersCollection.aggregate([
        { $match: { status: 'Delivered', paymentStatus: 'Paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]).toArray()
    ]);

    // Calculate revenue
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get orders by status
    const ordersByStatus = await ordersCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const stats = {
      overview: {
        totalUsers,
        totalRestaurants,
        newRegisteredRestaurants,
        totalOrders,
        totalRestaurantOwners,
        totalRevenue: totalRevenue.toFixed(2)
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer,
        restaurantName: order.restaurantName,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt || order.orderTime
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/dashboard/activity
// @access  Private
export const getRecentActivity = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();

    // Ensure connection is ready
    if (customerConn.readyState !== 1) {
      await customerConn.asPromise();
    }

    const limit = parseInt(req.query.limit) || 20;

    const usersCollection = customerConn.collection('users');
    const ordersCollection = customerConn.collection('orders');
    const restaurantsCollection = customerConn.collection('newregisteredrestaurants');

    // Get recent activities
    const [recentUsers, recentOrders, recentRestaurants] = await Promise.all([
      usersCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      ordersCollection.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
      restaurantsCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray()
    ]);

    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_registered',
        description: `New user registered: ${user.name}`,
        timestamp: user.createdAt,
        data: { userId: user._id, email: user.email }
      })),
      ...recentOrders.map(order => ({
        type: 'order_placed',
        description: `Order ${order.orderNumber} placed`,
        timestamp: order.createdAt || order.orderTime,
        data: { orderId: order._id, total: order.total }
      })),
      ...recentRestaurants.map(restaurant => ({
        type: 'restaurant_registered',
        description: `New restaurant registered: ${restaurant.name}`,
        timestamp: restaurant.registeredAt || restaurant.createdAt,
        data: { restaurantId: restaurant._id }
      }))
    ];

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: activities.slice(0, limit)
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    });
  }
};
