import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { ordersAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import OrderCard from '../components/OrderCard';
import { BellAlertIcon } from '@heroicons/react/24/outline';

const AvailableOrders = () => {
  const navigate = useNavigate();
  const { newOrderNotification, clearNotification } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAvailableOrders();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (newOrderNotification) {
      fetchAvailableOrders();
    }
  }, [newOrderNotification]);

  const fetchAvailableOrders = async () => {
    try {
      setRefreshing(true);
      const response = await ordersAPI.getAvailable();
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (orderId) => {
    if (!confirm('Are you sure you want to accept this order?')) {
      return;
    }

    try {
      const response = await ordersAPI.accept(orderId);
      if (response.data.success) {
        alert('Order accepted successfully!');
        clearNotification();
        navigate('/orders/active');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert(error.response?.data?.message || 'Failed to accept order');
      fetchAvailableOrders();
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    try {
      const response = await ordersAPI.reject(orderId, reason);
      if (response.data.success) {
        fetchAvailableOrders();
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Available Orders</h1>
            <p className="mt-1 text-gray-600">
              {orders.length} order{orders.length !== 1 ? 's' : ''} available for delivery
            </p>
          </div>
          <button
            onClick={fetchAvailableOrders}
            disabled={refreshing}
            className="px-4 py-2 text-white rounded-lg transition bg-primary hover:bg-opacity-90 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* New Order Notification */}
        {newOrderNotification && (
          <div className="p-4 mb-6 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <BellAlertIcon className="mr-3 w-6 h-6 text-green-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-800">New Order Available!</h3>
                <p className="mt-1 text-sm text-green-700">
                  Order from {newOrderNotification.restaurantName} - ₹{newOrderNotification.deliveryFee}
                </p>
              </div>
              <button
                onClick={() => {
                  clearNotification();
                  fetchAvailableOrders();
                }}
                className="ml-4 text-sm font-medium text-green-700 hover:text-green-900"
              >
                View
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow">
            <div className="inline-block p-4 mb-4 bg-gray-100 rounded-full">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">No Orders Available</h3>
            <p className="mb-4 text-gray-600">New orders will appear here when restaurants prepare them</p>
            <button
              onClick={fetchAvailableOrders}
              className="px-6 py-2 text-white rounded-lg transition bg-primary hover:bg-opacity-90"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableOrders;
