import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/adminApi';
import { 
  BuildingStorefrontIcon, 
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [restaurantOrderDetails, setRestaurantOrderDetails] = useState({});
  const [loadingOrders, setLoadingOrders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurantOrders();
  }, []);

  const fetchRestaurantOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getByRestaurant();
      
      if (response.data.success) {
        setRestaurantOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = async (restaurantId, restaurantName) => {
    if (expandedRestaurant === restaurantId) {
      // Collapse if already expanded
      setExpandedRestaurant(null);
      return;
    }

    // Expand and load orders
    setExpandedRestaurant(restaurantId);

    if (!restaurantOrderDetails[restaurantId]) {
      try {
        setLoadingOrders({ ...loadingOrders, [restaurantId]: true });
        const response = await ordersAPI.getRestaurantOrders(restaurantId, 1, 50);
        
        if (response.data.success) {
          setRestaurantOrderDetails({
            ...restaurantOrderDetails,
            [restaurantId]: response.data.data
          });
        }
      } catch (error) {
        console.error(`Error fetching orders for ${restaurantName}:`, error);
      } finally {
        setLoadingOrders({ ...loadingOrders, [restaurantId]: false });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Preparing':
      case 'Confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Orders by Restaurant</h2>
        <p className="mt-1 text-gray-600">
          View and manage orders grouped by restaurant ({restaurantOrders.length} restaurants with orders)
        </p>
      </div>

      {/* Restaurant Cards */}
      <div className="space-y-4">
        {restaurantOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow">
            <ShoppingCartIcon className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-800">No Orders Yet</h3>
            <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          restaurantOrders.map((restaurant) => (
            <div key={restaurant._id} className="overflow-hidden bg-white rounded-lg shadow">
              {/* Restaurant Header */}
              <div
                onClick={() => handleRestaurantClick(restaurant._id, restaurant.restaurantName)}
                className="p-6 transition cursor-pointer hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-1 items-center">
                    <div className="flex justify-center items-center w-12 h-12 text-xl font-bold text-white rounded-full bg-primary">
                      <BuildingStorefrontIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 ml-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {restaurant.restaurantName || 'Unknown Restaurant'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Last order: {new Date(restaurant.lastOrderDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6 mr-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{restaurant.totalOrders}</p>
                      <p className="text-xs text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{restaurant.pendingOrders}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{restaurant.completedOrders}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">₹{restaurant.totalRevenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div>
                    {expandedRestaurant === restaurant._id ? (
                      <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Orders Table (Expanded) */}
              {expandedRestaurant === restaurant._id && (
                <div className="border-t">
                  {loadingOrders[restaurant._id] ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
                    </div>
                  ) : restaurantOrderDetails[restaurant._id]?.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      No orders found for this restaurant
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Items</th>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {restaurantOrderDetails[restaurant._id]?.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                {order.orderNumber || order._id.slice(-8)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                {order.customerName || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                {order.items?.length || 0} items
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                ₹{order.total || order.totalAmount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                {new Date(order.createdAt || order.orderTime).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                <button
                                  onClick={() => navigate(`/orders/${order._id}`)}
                                  className="text-primary hover:text-opacity-80"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
