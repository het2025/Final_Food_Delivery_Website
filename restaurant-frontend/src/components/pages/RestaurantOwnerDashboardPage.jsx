import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  ShoppingCart,
  Download,
  TrendingUp,
  TrendingDown,
  X,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Plus
} from 'lucide-react';

import { 
  getDashboardStats, 
  getRestaurantOwnerOrders 
} from '../../api/restaurantOwnerApi';

function RestaurantOwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewOrder, setShowNewOrder] = useState(false);

  const [ordersData, setOrdersData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    dish: '',
    quantity: 1,
    specialInstructions: ''
  });

  // Load data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get dashboard stats
        const statsRes = await getDashboardStats();
        if (statsRes.success && statsRes.data) {
          setDashboardStats(statsRes.data);
        }

        // Get orders
        const ordersRes = await getRestaurantOwnerOrders();
        const orders = ordersRes.success && ordersRes.data?.orders 
          ? ordersRes.data.orders 
          : ordersRes.success && Array.isArray(ordersRes.data)
          ? ordersRes.data
          : [];
        setOrdersData(orders);

      } catch (err) {
        console.error('Dashboard data load error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Map orders for UI, always deducting ₹30 for delivery
  const mapOrder = (order) => {
    const id = order.orderNumber || order.orderId || `#${(order._id || '').toString().slice(-6) || 'ORDER'}`;
    const customer = order.customerName || order.user?.name || order.customer?.name || 'Customer';
    const itemsText = Array.isArray(order.items)
      ? order.items.map((item) => {
          const qty = item.quantity || item.qty || 1;
          const name = item.name || item.title || item.itemName || 'Item';
          return `${qty}x ${name}`;
        }).join(', ')
      : '—';
    const status = order.status || order.orderStatus || order.deliveryStatus || 'Pending';
    const created = order.createdAt || order.placedAt || order.created_on || null;
    let time = '';
    if (created) {
      time = new Date(created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Deduct delivery charge from every order
    const deliveryCharge = 30;
    const rawTotal = Number(order.totalAmount) || Number(order.total) || Number(order.finalAmount) || Number(order.amount) || 0;
    const netAmount = Math.max(rawTotal - deliveryCharge, 0);
    return {
      backendId: order._id?.toString() || '',
      id,
      customer,
      itemsText,
      status,
      time,
      createdAt: created,
      numericTotal: netAmount // <== always use this!
    };
  };

  // Group orders by day
  const groupOrdersByDay = (orders) => {
    const grouped = {};
    orders.forEach(order => {
      const orderDate = order.createdAt;
      if (!orderDate) return;
      const date = new Date(orderDate);
      const dateKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          fullDate: date,
          orders: [],
          totalOrders: 0,
          totalRevenue: 0
        };
      }
      grouped[dateKey].orders.push(order);
      grouped[dateKey].totalOrders += 1;
      grouped[dateKey].totalRevenue += order.numericTotal || 0; // <== uses net!
    });
    return Object.values(grouped).sort((a, b) => b.fullDate - a.fullDate);
  };

  // Use mapped orders everywhere for display and calculation
  const mappedOrders = ordersData.map(mapOrder);

  // Stats
  const totalOrders = mappedOrders.length;
  const pendingOrders = mappedOrders.filter(o => (o.status || '').toLowerCase() === 'pending' || (o.status || '').toLowerCase() === 'placed').length;
  const completedOrders = mappedOrders.filter(o => {
    const status = (o.status || '').toLowerCase();
    return status === 'delivered' || status === 'completed' || status === 'outfordelivery';
  }).length;
  const totalRevenue = mappedOrders.reduce((sum, order) => sum + (order.numericTotal || 0), 0); // <== uses net!
  const totalCustomers = (() => {
    const uniqueCustomers = new Set();
    ordersData.forEach(order => {
      const customerId =
        order.customer?._id?.toString() ||
        order.customer?.toString() ||
        order.customerPhone ||
        order.customerName ||
        order.user?.email ||
        order.user?._id?.toString() ||
        null;
      if (customerId && customerId.trim() !== '') {
        uniqueCustomers.add(customerId);
      }
    });
    return uniqueCustomers.size;
  })();
  const stats = [
    { label: "Total Orders", value: String(totalOrders), icon: ShoppingCart, change: 0 },
    { label: 'Total Customers', value: String(totalCustomers), icon: Users, change: 0 },
    { label: 'Completed Orders', value: String(completedOrders), icon: CheckCircle, change: 0 },
    { label: 'Total Revenue', value: totalRevenue > 0 
      ? `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
      : '₹0', icon: BarChart3, change: 0 }
  ];
  const ordersByDay = groupOrdersByDay(mappedOrders);

  // Order status helpers
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'pending' || s === 'placed') return 'bg-yellow-100 text-yellow-800';
    if (s === 'processing' || s === 'preparing') return 'bg-blue-100 text-blue-800';
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return CheckCircle;
    if (s === 'pending' || s === 'placed') return Clock;
    if (s === 'cancelled' || s === 'rejected') return AlertCircle;
    return Clock;
  };

  // Order form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrderForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleNewOrderSubmit = (e) => {
    e.preventDefault();
    setShowNewOrder(false);
    setNewOrderForm({ customerName: '', dish: '', quantity: 1, specialInstructions: '' });
  };

  // Tabs
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <div key={stat.label} className="h-32 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-2">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="flex flex-col justify-end flex-grow">
                  <p className="mb-1 text-sm text-gray-600">{stat.label}</p>
                  <h3 className="text-2xl font-bold leading-none">{stat.value}</h3>
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center mt-2 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    {isPositive ? '+' : ''}
                    {stat.change}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Orders Per Day */}
      <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Orders </h2>
          <button onClick={() => setActiveTab('orders')} className="text-sm text-orange-600 hover:text-orange-700">
            View All Orders
          </button>
        </div>
        <div className="space-y-4">
          {ordersByDay.length === 0 && (
            <p className="py-8 text-sm text-center text-gray-500">
              No orders yet
            </p>
          )}
          {ordersByDay.slice(0, 7).map((dayData, idx) => {
            const isToday = new Date(dayData.fullDate).toDateString() === new Date().toDateString();
            return (
              <div key={idx} className={`p-4 rounded-lg border transition-all ${isToday ? 'bg-orange-50 border-orange-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{isToday ? '📅 Today' : dayData.date}</h3>
                    <p className="text-sm text-gray-600">{dayData.totalOrders} {dayData.totalOrders === 1 ? 'order' : 'orders'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      ₹{dayData.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
                <div className="pt-3 space-y-2 border-t border-gray-200">
                  {dayData.orders.slice(0, 3).map((order, orderIdx) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div key={orderIdx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon size={14} className={
                            order.status.toLowerCase() === 'pending' 
                              ? 'text-yellow-600' 
                              : order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          } />
                          <span className="text-gray-700">{order.id}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600">{order.customer}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          {/* DISPLAY NET AMOUNT ONLY */}
                          <span className="font-medium text-gray-700">
                            ₹{order.numericTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayData.orders.length > 3 && (
                    <button onClick={() => setActiveTab('orders')} className="w-full pt-2 text-xs text-orange-600 hover:text-orange-700">
                      +{dayData.orders.length - 3} more orders
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {ordersByDay.length > 7 && (
          <div className="mt-4 text-center">
            <button onClick={() => setActiveTab('orders')} className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700">
              View older orders →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Orders table uses `mappedOrders`
  const OrdersTab = () => (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex flex-col items-start justify-between gap-4 p-5 border-b border-gray-200 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold">All Orders ({totalOrders})</h2>
        <div className="flex items-center w-full gap-3 sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full py-2 pr-4 text-sm border border-gray-300 rounded-lg pl-9"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={16} />
            Filter
          </button>
          <button
            onClick={() => setShowNewOrder(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90"
          >
            <Plus size={16} />
            New Order
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Items
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Total
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mappedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-sm text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
            {mappedOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <tr key={order.backendId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{order.id}</div>
                    <div className="text-xs text-gray-500">{order.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      {order.customer}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 truncate">{order.itemsText}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                      <StatusIcon size={12} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">
                      ₹{order.numericTotal.toFixed(2)} {/* <== ONLY THIS, DO NOT USE order.total! */}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 rounded hover:bg-blue-50">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-orange-600 rounded hover:bg-orange-50">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-red-600 rounded hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {mappedOrders.length} of {totalOrders} orders
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'orders':
        return <OrdersTab />;
      default:
        return <OverviewTab />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-8">
      {/* Header */}
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              QB - Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 mb-4 text-sm text-red-700 rounded-lg bg-red-50">
          {error}
        </div>
      )}
      {/* Tab Buttons */}
      <div className="flex gap-2 p-1 mb-8 bg-white shadow-sm rounded-xl">
        {['overview', 'orders'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>
      {/* Tab Contents */}
      {renderTabContent()}
      {/* New Order Modal */}
      {showNewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowNewOrder(false)}
        >
          <div
            className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Create New Order</h2>
              <button onClick={() => setShowNewOrder(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNewOrderSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={newOrderForm.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Dish
                </label>
                <input
                  type="text"
                  name="dish"
                  value={newOrderForm.dish}
                  onChange={handleInputChange}
                  placeholder="Enter dish name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newOrderForm.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={newOrderForm.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Any special instructions..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setShowNewOrder(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantOwnerDashboardPage;
