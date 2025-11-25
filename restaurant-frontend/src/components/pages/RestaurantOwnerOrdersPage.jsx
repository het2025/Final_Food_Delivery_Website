import React, { useEffect, useState } from 'react';
import {
  ClipboardList, CheckCircle, Clock, XCircle, IndianRupee, X,
  MapPin, User, Phone, Package
} from 'lucide-react';
import {
  getRestaurantOwnerOrders,
  updateRestaurantOwnerOrderStatus,
  getRestaurantOwnerOrderById
} from '../../api/restaurantOwnerApi';

function RestaurantOwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(false);

  const allowedStatuses = [
    'Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery', 'Cancelled'
  ];

  const statusTimeline = [
    { key: 'Pending', label: 'Order Placed', icon: ClipboardList },
    { key: 'Accepted', label: 'Accepted', icon: CheckCircle },
    { key: 'Preparing', label: 'Preparing', icon: Clock },
    { key: 'Ready', label: 'Ready', icon: Package },
    { key: 'OutForDelivery', label: 'Out for Delivery', icon: MapPin }
  ];

  // UPDATED: always subtract ₹30 from all total calculations
  const mapOrderFromBackend = (order) => {
    const id = order.orderNumber || order.orderId || order._id || order.id || "Unknown";
    const customer = order.customerName || order.user?.name || order.customer?.name || "Customer";
    let itemsText = '—';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsText = order.items
        .map((item) => {
          const qty = item.quantity || item.qty || 1;
          const name = item.name || item.title || item.itemName || 'Item';
          return `${qty}x ${name}`;
        })
        .join(', ');
    }
    const status = order.status || order.orderStatus || order.deliveryStatus || 'Pending';
    const created = order.createdAt || order.placedAt || order.created_on || null;
    let time = '';
    if (created) {
      time = new Date(created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // YOUR ACTUAL REVENUE = subtotal minus delivery charge:
    const deliveryCharge = 30;
    const rawTotal = Number(order.totalAmount) || Number(order.total) || Number(order.finalAmount) || Number(order.amount) || 0;
    const netAmount = Math.max(rawTotal - deliveryCharge, 0);

    return {
      backendId: order._id?.toString() || '',
      id,
      customer,
      items: itemsText,
      status,
      time,
      netAmount // 👈 use ONLY this everywhere below!
    };
  };

  // Only use netAmount for all calculations and displays!
  const computeSummary = (mappedOrders) => {
    const totalOrders = mappedOrders.length;
    const completed = mappedOrders.filter((o) =>
      ['OutForDelivery', 'Delivered'].includes(o.status)
    ).length;
    const cancelled = mappedOrders.filter(
      (o) => o.status === 'Cancelled'
    ).length;
    const pending = totalOrders - completed - cancelled;
    return { totalOrders, pending, completed, cancelled };
  };

  // Revenue sum, using ONLY netAmount!
  const computeTodayRevenue = (mappedOrders) => {
    return mappedOrders.reduce(
      (sum, o) => sum + (o.netAmount || 0), 0
    );
  };

  useEffect(() => {
    let isFirstLoad = true;
    const loadOrders = async () => {
      try {
        if (isFirstLoad) setLoading(true);
        setBackendError('');
        const res = await getRestaurantOwnerOrders();
        if (!res.success) throw new Error(res.message || 'Failed to load orders');
        const data = res.data?.orders || res.data || [];
        const ordersArray = Array.isArray(data) ? data : [];
        const mapped = ordersArray.map(mapOrderFromBackend);

        // New order notification check
        if (!isFirstLoad && orders.length > 0 && mapped.length > orders.length) {
          setNewOrderNotification(true);
          setTimeout(() => setNewOrderNotification(false), 5000);
        }
        setOrders(mapped);
        isFirstLoad = false;
      } catch (err) {
        setBackendError(err.message || 'Failed to load restaurant owner orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
    const intervalId = setInterval(loadOrders, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusChange = async (orderBackendId, newStatus) => {
    try {
      setUpdatingOrderId(orderBackendId);
      setBackendError('');
      const res = await updateRestaurantOwnerOrderStatus(orderBackendId, newStatus);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to update order status');
      }
      setOrders((prev) =>
        prev.map((o) => {
          if (o.backendId === orderBackendId) {
            return { ...o, status: newStatus };
          }
          return o;
        })
      );
    } catch (err) {
      setBackendError(err.message || 'Failed to update order status');
      setTimeout(() => { window.location.reload(); }, 1500);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewDetails = async (orderBackendId) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      setSelectedOrderDetails(null);
      const res = await getRestaurantOwnerOrderById(orderBackendId);
      if (!res.success) throw new Error(res.message || 'Failed to load order details');
      setSelectedOrderDetails(res.data);
    } catch (err) {
      setBackendError(err.message || 'Failed to load order details');
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const summaryCounts = computeSummary(orders);
  const todayRevenue = computeTodayRevenue(orders);

  const summary = [
    { label: 'Total Orders', value: summaryCounts.totalOrders, icon: <ClipboardList className="text-blue-600" /> },
    { label: 'Pending', value: summaryCounts.pending, icon: <Clock className="text-yellow-500" /> },
    { label: 'Completed', value: summaryCounts.completed, icon: <CheckCircle className="text-green-600" /> },
    { label: 'Cancelled', value: summaryCounts.cancelled, icon: <XCircle className="text-red-500" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        📦 Restaurant Owner Order Management
      </h1>

      {backendError && (
        <div className="px-4 py-2 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
          {backendError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center p-5 space-x-4 bg-white rounded-xl shadow-md"
          >
            <div className="text-3xl">{card.icon}</div>
            <div>
              <div className="text-xl font-bold">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Orders Table - always use netAmount */}
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.backendId + idx} className="border-t">
                  <td className="px-4 py-2 font-medium">{order.id}</td>
                  <td className="px-4 py-2">{order.customer}</td>
                  <td className="px-4 py-2">{order.items}</td>
                  <td className="px-4 py-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.backendId, e.target.value)
                      }
                      disabled={
                        updatingOrderId === order.backendId ||
                        order.status === 'OutForDelivery' ||
                        order.status === 'Cancelled'
                      }
                      className={`text-xs md:text-sm font-semibold border rounded-lg px-2 py-1 ${
                        order.status === 'OutForDelivery' ||
                        order.status === 'Delivered'
                          ? 'text-green-600 border-green-300 bg-green-50 cursor-not-allowed'
                          : order.status === 'Cancelled'
                          ? 'text-red-500 border-red-300 bg-red-50 cursor-not-allowed'
                          : 'text-yellow-600 border-yellow-300 bg-yellow-50'
                      }`}
                    >
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status === 'OutForDelivery' ? 'Out for Delivery (Final)' : status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {order.time || '-'}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    ₹{order.netAmount.toFixed(2)} {/* <== always shows net of delivery */}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleViewDetails(order.backendId)}
                      className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      disabled={loadingDetails}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No orders found for this restaurant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="flex justify-between items-center p-6 mt-10 bg-gradient-to-r from-green-100 to-white rounded-xl shadow-md">
        <div>
          <h3 className="text-lg font-semibold text-green-800">
            Today's Revenue
          </h3>
          <p className="flex items-center mt-2 text-2xl font-bold text-green-700">
            <IndianRupee className="mr-1" size={20} />
            {todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
          alt="Revenue"
          className="w-16 h-16"
        />
      </div>
    </div>
  );
}

export default RestaurantOwnerOrdersPage;
