import React, { useState, useEffect } from 'react';
import { restaurantsAPI } from '../api/adminApi';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';

const RestaurantApprovals = () => {
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="flex items-center px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <EyeIcon className="w-5 h-5 mr-2" />
                  View Detail
                </button>
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

      {/* Restaurant Details Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b">
              <h3 className="text-xl font-bold text-gray-800">Restaurant Details</h3>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  {selectedRestaurant.image ? (
                    <img
                      src={selectedRestaurant.image}
                      alt={selectedRestaurant.name}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedRestaurant.name}</h4>
                    <p className="text-gray-600 mt-1">{selectedRestaurant.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Owner Name</span>
                      <p className="font-medium text-gray-900">{selectedRestaurant.ownerName || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Contact</span>
                      <p className="font-medium text-gray-900">{selectedRestaurant.contact?.phone || selectedRestaurant.phone || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                      <p className="font-medium text-gray-900">{selectedRestaurant.contact?.email || selectedRestaurant.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs font-semibold text-gray-500 uppercase">GST Number</span>
                      <p className="font-medium text-gray-900">{selectedRestaurant.gstNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              {/* Location & Operations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Location Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Address:</span> {selectedRestaurant.location?.address}</p>
                    <p><span className="font-medium">Area:</span> {selectedRestaurant.location?.area}</p>
                    <p><span className="font-medium">City:</span> {selectedRestaurant.location?.city}, {selectedRestaurant.location?.state}</p>
                    <p><span className="font-medium">Pincode:</span> {selectedRestaurant.location?.pincode}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Operational Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Cuisines:</span> {selectedRestaurant.cuisine?.join(', ') || 'N/A'}</p>
                    <p><span className="font-medium">Price Range:</span> {selectedRestaurant.priceRange}</p>
                    <p><span className="font-medium">Delivery Time:</span> {selectedRestaurant.deliveryTime} mins</p>
                    <p><span className="font-medium">Registered At:</span> {new Date(selectedRestaurant.registeredAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleReject(selectedRestaurant._id, selectedRestaurant.name);
                  setSelectedRestaurant(null);
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedRestaurant._id, selectedRestaurant.name);
                  setSelectedRestaurant(null);
                }}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantApprovals;
