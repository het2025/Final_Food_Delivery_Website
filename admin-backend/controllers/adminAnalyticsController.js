import mongoose from 'mongoose';

// Connection management
let customerDB;

const getCustomerDB = async () => {
    if (!customerDB) {
        customerDB = mongoose.createConnection(process.env.MONGO_URI);
    }
    // Always wait for connection to be ready
    if (customerDB.readyState !== 1) {
        await customerDB.asPromise();
    }
    return customerDB;
};

// @desc    Get analytics overview with trends
// @route   GET /api/admin/analytics/overview
export const getAnalyticsOverview = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');
        const usersCollection = conn.collection('users');
        const restaurantsCollection = conn.collection('restaurants');

        // Date calculations
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of the month

        // Helper for monthly aggregation
        const getMonthlyStats = async (collection, dateField = 'createdAt', sumField = null, match = {}) => {
            const pipeline = [
                { $match: { ...match, [dateField]: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: `$${dateField}` },
                            month: { $month: `$${dateField}` }
                        },
                        value: sumField ? { $sum: `$${sumField}` } : { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ];
            const result = await collection.aggregate(pipeline).toArray();

            // Format to Month Name (e.g., "Jan")
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            // Fill missing months
            const filledData = [];
            for (let i = 0; i < 6; i++) {
                const d = new Date(sixMonthsAgo);
                d.setMonth(d.getMonth() + i);
                const year = d.getFullYear();
                const month = d.getMonth() + 1; // 1-indexed

                const found = result.find(r => r._id.year === year && r._id.month === month);
                filledData.push({
                    month: monthNames[month - 1],
                    value: found ? found.value : 0
                });
            }
            return filledData;
        };

        const [
            totalUsers,
            totalOrders,
            totalRestaurants,
            revenueData,
            monthlyRevenue,
            monthlyOrders,
            monthlyUsers,
            monthlyRestaurants
        ] = await Promise.all([
            usersCollection.countDocuments({ role: 'customer' }),
            ordersCollection.countDocuments({}),
            restaurantsCollection.countDocuments({ isActive: true }),
            ordersCollection.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]).toArray(),
            getMonthlyStats(ordersCollection, 'createdAt', 'total'),
            getMonthlyStats(ordersCollection, 'createdAt', null),
            getMonthlyStats(usersCollection, 'createdAt', null, { role: 'customer' }),
            getMonthlyStats(restaurantsCollection, 'createdAt', null) // New restaurants per month
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalRestaurants,
                totalRevenue: revenueData[0]?.total || 0,
                monthlyStats: {
                    revenue: monthlyRevenue,
                    orders: monthlyOrders,
                    users: monthlyUsers,
                    restaurants: monthlyRestaurants
                }
            }
        });
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
};

// @desc    Get order status distribution (for gauge/pie chart)
// @route   GET /api/admin/analytics/order-status
export const getOrderStatusDistribution = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');

        const distribution = await ordersCollection.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const total = distribution.reduce((sum, d) => sum + d.count, 0);
        const data = distribution.map(d => ({
            status: d._id || 'Unknown',
            count: d.count,
            percentage: total > 0 ? Math.round((d.count / total) * 100) : 0
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Order status distribution error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order status' });
    }
};

// @desc    Get orders trend over time (for area chart)
// @route   GET /api/admin/analytics/orders-trend
export const getOrdersTrend = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');
        const months = parseInt(req.query.months) || 6;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const trend = await ordersCollection.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' } // Ensure daily data for area chart
                    },
                    formattedDate: { $first: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]).toArray();

        const data = trend.map(t => ({
            date: t.formattedDate,
            orders: t.orders,
            revenue: t.revenue || 0
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Orders trend error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders trend' });
    }
};

// @desc    Get orders by day of week (for bar chart)
// @route   GET /api/admin/analytics/orders-by-day
export const getOrdersByDayOfWeek = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const result = await ordersCollection.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' }, // 1 = Sunday, 7 = Saturday
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        // Fill in missing days with 0
        const data = dayNames.map((name, index) => {
            const found = result.find(r => r._id === index + 1);
            return { day: name, orders: found?.count || 0 };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Orders by day error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders by day' });
    }
};

// @desc    Get peak hours heatmap data
// @route   GET /api/admin/analytics/peak-hours
export const getPeakHours = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');

        const result = await ordersCollection.aggregate([
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$createdAt' },
                        hour: { $hour: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Create heatmap data structure
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

        const heatmapData = [];
        hours.forEach((hourLabel, hourIndex) => {
            const row = { hour: hourLabel };
            dayNames.forEach((day, dayIndex) => {
                const found = result.find(r =>
                    r._id.dayOfWeek === dayIndex + 1 &&
                    r._id.hour === hourIndex
                );
                row[day] = found?.count || 0;
            });
            heatmapData.push(row);
        });

        res.json({ success: true, data: heatmapData });
    } catch (error) {
        console.error('Peak hours error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch peak hours' });
    }
};

// @desc    Get top restaurants by orders
// @route   GET /api/admin/analytics/top-restaurants
export const getTopRestaurants = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');
        const limit = parseInt(req.query.limit) || 10;

        const result = await ordersCollection.aggregate([
            {
                $group: {
                    _id: '$restaurantName',
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { orders: -1 } },
            { $limit: limit }
        ]).toArray();

        const data = result.map(r => ({
            name: r._id || 'Unknown',
            orders: r.orders,
            revenue: r.revenue || 0
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Top restaurants error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch top restaurants' });
    }
};

// @desc    Get payment method split
// @route   GET /api/admin/analytics/payment-split
export const getPaymentSplit = async (req, res) => {
    try {
        const conn = await getCustomerDB();
        const ordersCollection = conn.collection('orders');

        const result = await ordersCollection.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        const data = result.map(r => ({
            method: r._id || 'Unknown',
            count: r.count
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Payment split error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment split' });
    }
};
