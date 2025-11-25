import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { profileAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import {
  TruckIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { deliveryBoy, updateDeliveryBoy } = useDelivery();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await profileAPI.getEarnings();
      if (response.data.success) {
        setEarnings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const response = await profileAPI.toggleOnline();
      if (response.data.success) {
        updateDeliveryBoy(response.data.data);
      }
    } catch (error) {
      console.error('Error toggling online:', error);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await profileAPI.toggleAvailability();
      if (response.data.success) {
        updateDeliveryBoy(response.data.data);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(error.response?.data?.message || 'Failed to update availability');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="p-6 mb-8 text-white bg-gradient-to-r rounded-lg from-primary to-secondary">
          <h1 className="mb-2 text-3xl font-bold">Welcome, {deliveryBoy?.name}! 👋</h1>
          <p className="text-white text-opacity-90">Ready to start delivering?</p>
        </div>

        {/* Status Controls */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Online Status</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">
                  {deliveryBoy?.isOnline ? 'You are currently online' : 'You are currently offline'}
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryBoy?.isOnline ? 'You can receive orders' : 'Go online to receive orders'}
                </p>
              </div>
              <button
                onClick={handleToggleOnline}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  deliveryBoy?.isOnline
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {deliveryBoy?.isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Availability</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">
                  {deliveryBoy?.isAvailable ? 'Available for orders' : 'Not available'}
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryBoy?.isAvailable ? 'You can accept new orders' : 'You cannot accept new orders'}
                </p>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={!deliveryBoy?.isOnline}
                className={`px-6 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  deliveryBoy?.isAvailable
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {deliveryBoy?.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-800">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyRupeeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-gray-800">{earnings?.completedOrders || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">Avg. Per Order</p>
                <p className="text-3xl font-bold text-gray-800">₹{earnings?.averageEarningsPerOrder || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TruckIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">Rating</p>
                <p className="text-3xl font-bold text-gray-800">{earnings?.rating || 5.0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <StarIcon className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate('/orders/available')}
            className="p-6 text-left bg-white rounded-lg shadow transition hover:shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-opacity-10 rounded-full bg-primary">
                <TruckIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800">Available Orders</h3>
            </div>
            <p className="text-sm text-gray-600">View and accept available delivery orders</p>
          </button>

          <button
            onClick={() => navigate('/orders/active')}
            className="p-6 text-left bg-white rounded-lg shadow transition hover:shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800">Active Delivery</h3>
            </div>
            <p className="text-sm text-gray-600">Track your current delivery</p>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="p-6 text-left bg-white rounded-lg shadow transition hover:shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800">History</h3>
            </div>
            <p className="text-sm text-gray-600">View your delivery history</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
