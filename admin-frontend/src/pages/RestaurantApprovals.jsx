import React, { useState, useEffect } from 'react';
import { restaurantsAPI } from '../api/adminApi';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';

const RestaurantApprovals = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingRestaurants();

    // ✅ Connect to Restaurant Backend Socket (Port 5001)
    const socket = io('http://localhost:5001');

    socket.on('connect', () => {
      console.log('🔌 Connected to Restaurant Backend Socket');
    });

    socket.on('restaurant_registered', (data) => {
      console.log('🔔 New restaurant registration received:', data);
      // Refresh the list automatically
      fetchPendingRestaurants();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPendingRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getPending();

      if (response.data.success) {
        setPendingRestaurants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId, restaurantName) => {
    if (!confirm(`Approve "${restaurantName}"?`)) {
      return;
    }

    try {
      setActionLoading(restaurantId);
      const response = await restaurantsAPI.approve(restaurantId);

      if (response.data.success) {
        alert('Restaurant approved successfully!');
        fetchPendingRestaurants();
      }
    } catch (error) {
      console.error('Error approving restaurant:', error);
      alert('Failed to approve restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (restaurantId, restaurantName) => {
    const reason = prompt(`Reject "${restaurantName}"?\n\nPlease provide a reason:`);

    if (!reason) {
      return;
    }

    try {
      setActionLoading(restaurantId);
      const response = await restaurantsAPI.reject(restaurantId, reason);

      if (response.data.success) {
        alert('Restaurant rejected');
        fetchPendingRestaurants();
      }
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      alert('Failed to reject restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Restaurant Approvals</h2>
        <p className="mt-1 text-gray-600">
          {pendingRestaurants.length} restaurant(s) waiting for approval
        </p>
      </div>

      {/* Pending Restaurants */}
      {pendingRestaurants.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg shadow">
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="mb-2 text-xl font-semibold text-gray-800">All Caught Up!</h3>
          <p className="text-gray-600">No restaurants pending approval at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingRestaurants.map((restaurant) => (
            <div key={restaurant._id} className="overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1">
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="object-cover w-20 h-20 rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white rounded-lg bg-primary">
                        {restaurant.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 ml-6">
                      <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
                      <p className="mt-1 text-gray-600">{restaurant.description}</p>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Owner</p>
                          <p className="font-medium text-gray-800">{restaurant.ownerName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contact</p>
                          <p className="font-medium text-gray-800">{restaurant.contact?.phone || restaurant.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-800">
                            {restaurant.location?.area}, {restaurant.location?.city}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cuisine</p>
                          <p className="font-medium text-gray-800">
                            {restaurant.cuisine?.join(', ') || restaurant.cuisines?.join(', ') || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {restaurant.registeredAt && (
                        <p className="mt-4 text-xs text-gray-500">
                          Registered on: {new Date(restaurant.registeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end px-6 py-4 space-x-3 border-t bg-gray-50">
                <button
                  onClick={() => handleReject(restaurant._id, restaurant.name)}
                  disabled={actionLoading === restaurant._id}
                  className="flex items-center px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(restaurant._id, restaurant.name)}
                  disabled={actionLoading === restaurant._id}
                  className="flex items-center px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  {actionLoading === restaurant._id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantApprovals;
