import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { Additive } from '../models/Additive.js';  // Stub provided below
import { Extra } from '../models/Extra.js';  // Stub provided below
import { findRestaurantByOwner } from '../models/Restaurant.js';
import { Payout } from '../models/Payout.js'; // ✅ NEW

// Helper: Get restaurant ID for current restaurant owner (fixed field)
const getRestaurantId = async (restaurantOwnerId) => {
  const restaurant = await findRestaurantByOwner(restaurantOwnerId);  // Fixed: { owner }
  return restaurant ? restaurant._id : null;
};

// GET /api/dashboard/stats
export const getRestaurantOwnerDashboardStats = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;

    const restaurantId = await getRestaurantId(restaurantOwnerId);
    if (!restaurantId) {
      console.log('No restaurant for dashboard – owner:', restaurantOwnerId);
      return res.json({  // Fixed: success: true for graceful handling
        success: true,
        data: null,
        message: 'No restaurant linked. Create your store profile in the Store page first.'
      });
    }

    // Parallel queries
    const [
      ordersCount,
      totalRevenue,
      menuItemsCount,
      categoriesCount,
      additivesCount,
      extrasCount,
      popularItem,
      pendingOrders,
      completedOrders,
      avgDeliveryTime
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ restaurant: restaurantId }),  // Fixed: restaurant ref

      // Total revenue (completed/delivered)
      Order.aggregate([
        { $match: { restaurant: restaurantId, status: 'delivered' } },  // Enum: lowercase? Adjust if 'Delivered'
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(results => results[0]?.total || 0),

      // Menu items
      MenuItem.countDocuments({ restaurant: restaurantId }),  // Fixed: restaurant ref

      // Categories
      MenuCategory.countDocuments({ restaurant: restaurantId }),

      // Additives
      Additive.countDocuments({ restaurant: restaurantId }),

      // Extras
      Extra.countDocuments({ restaurant: restaurantId }),

      // Popular item (fixed aggregate: collection, field)
      Order.aggregate([
        { $match: { restaurant: restaurantId } },
        { $unwind: '$items' },
        { $group: { _id: '$items.menuItemId', count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },  // Fixed collection
        { $unwind: { path: '$item', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$item.name', orders: '$count' } }
      ]).then(results => results[0] || { name: 'None', orders: 0 }),

      // Pending
      Order.countDocuments({ restaurant: restaurantId, status: { $in: ['pending', 'preparing'] } }),

      // Completed
      Order.countDocuments({ restaurant: restaurantId, status: 'delivered' }),

      // Avg delivery (ms to min)
      Order.aggregate([
        { $match: { restaurant: restaurantId, status: 'delivered' } },
        { $group: { _id: null, avgTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } } } }
      ]).then(results => {
        const avgMs = results[0]?.avgTime || 0;
        return Math.round(avgMs / (1000 * 60)) || 0;
      })
    ]);

    const stats = {
      orders: {
        total: ordersCount,
        pending: pendingOrders,
        completed: completedOrders,
        revenue: totalRevenue
      },
      menu: {
        items: menuItemsCount,
        categories: categoriesCount,
        additives: additivesCount,
        extras: extrasCount,
        popularItem: popularItem.name !== 'None' ? `${popularItem.name} (${popularItem.orders} orders)` : 'None'
      },
      operations: {
        avgDeliveryTime: `${avgDeliveryTime} minutes`
      }
    };

    res.json({
      success: true,
      data: stats,
      message: 'Dashboard stats loaded successfully'
    });
  } catch (error) {
    console.error('getRestaurantOwnerDashboardStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard stats'
    });
  }
};

// ✅ GET /api/dashboard/payouts-stats
export const getPayoutStats = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    console.log('🔍 Calculating payouts for restaurantId:', restaurantId);

    // Calculate Total Revenue from ALL orders
    const result = await Order.aggregate([
      {
        $match: {
          restaurant: restaurantId
        }
      },
      {
        $group: {
          _id: null,
          totalDishPrice: { $sum: { $ifNull: ['$subtotal', 0] } },
          totalTaxes: { $sum: { $ifNull: ['$taxes', 0] } },
          totalRevenue: { $sum: { $add: [{ $ifNull: ['$subtotal', 0] }, { $ifNull: ['$taxes', 0] }] } }
        }
      }
    ]);

    console.log('📊 Order aggregation result:', JSON.stringify(result));

    const stats = result[0] || { totalDishPrice: 0, totalTaxes: 0, totalRevenue: 0 };

    console.log('💰 Stats calculated:', stats);

    // Calculate total already paid out
    const payoutResult = await Payout.aggregate([
      { $match: { restaurantId: restaurantId, status: 'Completed' } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } }
    ]);

    const totalPaid = payoutResult[0]?.totalPaid || 0;

    console.log('💵 Total already paid:', totalPaid);

    // Pending payout = Total revenue - Total paid
    const pendingPayout = stats.totalRevenue - totalPaid;

    console.log('✅ Pending payout:', pendingPayout);

    res.json({
      success: true,
      data: {
        totalRevenue: stats.totalRevenue,
        totalPaid: totalPaid,
        pendingPayout: Math.max(0, pendingPayout), // Ensure non-negative
        breakdown: {
          dishPrice: stats.totalDishPrice,
          taxes: stats.totalTaxes
        }
      }
    });

  } catch (error) {
    console.error('getPayoutStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payout stats' });
  }
};

// ✅ POST /api/dashboard/collect-payout
export const collectPayout = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { amount, breakdown } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payout amount' });
    }

    // Create payout record
    const payout = new Payout({
      restaurantId: restaurantId,
      amount: amount,
      breakdown: breakdown || {},
      status: 'Completed',
      transactionDate: new Date()
    });

    await payout.save();

    res.status(201).json({
      success: true,
      message: 'Payout collected successfully',
      data: payout
    });

  } catch (error) {
    console.error('collectPayout error:', error);
    res.status(500).json({ success: false, message: 'Failed to collect payout' });
  }
};

// ✅ GET /api/dashboard/payout-history
export const getPayoutHistory = async (req, res) => {
  try {
    const restaurantOwnerId = req.restaurantOwner.id;
    const restaurantId = await getRestaurantId(restaurantOwnerId);

    if (!restaurantId) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const payouts = await Payout.find({ restaurantId: restaurantId })
      .sort({ transactionDate: -1 })
      .limit(50); // Limit to recent 50 payouts

    res.json({
      success: true,
      data: payouts
    });

  } catch (error) {
    console.error('getPayoutHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payout history' });
  }
};
