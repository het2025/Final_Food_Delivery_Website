import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { Additive } from '../models/Additive.js';  // Stub provided below
import { Extra } from '../models/Extra.js';  // Stub provided below
import { findRestaurantByOwner } from '../models/Restaurant.js';

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
