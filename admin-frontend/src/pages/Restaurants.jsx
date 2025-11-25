import React, { useState, useEffect } from 'react';
import { restaurantsAPI } from '../api/adminApi';
import { MagnifyingGlassIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, search, statusFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getAll(currentPage, 20, search, statusFilter);
      
      if (response.data.success) {
        setRestaurants(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (restaurantId, newStatus) => {
    if (!confirm(`Change restaurant status to "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await restaurantsAPI.updateStatus(restaurantId, newStatus);
      if (response.data.success) {
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      alert('Failed to update restaurant status');
    }
  };

  const handleDelete = async (restaurantId, restaurantName) => {
    if (!confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await restaurantsAPI.delete(restaurantId);
      if (response.data.success) {
        alert('Restaurant deleted successfully');
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Restaurant Management</h2>
          <p className="mt-1 text-gray-600">
            Manage all restaurants - {pagination.oldRestaurants || 0} approved, {pagination.newRestaurants || 0} newly registered
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Restaurant</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Cuisine</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="object-cover w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-primary">
                              {restaurant.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex items-center ml-4">
                            <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                            {/* NEW BADGE */}
                            {restaurant.isNew && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                                <SparklesIcon className="w-3 h-3 mr-1" />
                                NEW
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {restaurant.location?.area || restaurant.location?.city || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {restaurant.cuisines?.join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        ⭐ {restaurant.rating || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={restaurant.status}
                          onChange={(e) => handleStatusChange(restaurant._id, e.target.value)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-0 outline-none cursor-pointer ${
                            restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
                            restaurant.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(restaurant._id, restaurant.name)}
                          className="inline-flex items-center text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRestaurants} total)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
