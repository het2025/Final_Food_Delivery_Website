import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../api/adminApi';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await usersAPI.getById(id);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const { user, orders, stats } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/users')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Users
      </button>

      {/* User Info Card */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-20 h-20 text-3xl font-bold text-white rounded-full bg-primary">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <div className="flex items-center mt-2 space-x-4">
                <span className="flex items-center text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 mr-1" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.completedOrders || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">₹{stats.totalSpent || 0}</p>
            <p className="mt-1 text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {user.addresses && user.addresses.length > 0 && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Saved Addresses</h3>
          <div className="space-y-3">
            {user.addresses.map((address, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg bg-gray-50">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">{address.label || 'Address'}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {address.street}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Order History</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Restaurant</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {order.restaurantName}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
