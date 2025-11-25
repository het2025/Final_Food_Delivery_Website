import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { profileAPI } from '../api/axiosInstance';
import Header from '../components/Header';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const { deliveryBoy, updateDeliveryBoy } = useDelivery();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: deliveryBoy?.name || '',
    phone: deliveryBoy?.phone || '',
    vehicleType: deliveryBoy?.vehicleType || 'bike',
    vehicleNumber: deliveryBoy?.vehicleNumber || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await profileAPI.update(formData);
      if (response.data.success) {
        updateDeliveryBoy(response.data.data);
        setEditing(false);
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary to-secondary">
            <div className="flex items-center">
              <div className="flex justify-center items-center w-20 h-20 bg-white rounded-full">
                <UserCircleIcon className="w-16 h-16 text-primary" />
              </div>
              <div className="ml-6 text-white">
                <h2 className="text-2xl font-bold">{deliveryBoy?.name}</h2>
                <p className="mt-1 text-white text-opacity-90">
                  {deliveryBoy?.completedOrders || 0} deliveries completed
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    className="px-4 py-2 w-full rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 py-2 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 text-white rounded-lg bg-primary hover:bg-opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center py-3 border-b">
                  <EnvelopeIcon className="mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{deliveryBoy?.email}</p>
                  </div>
                </div>

                <div className="flex items-center py-3 border-b">
                  <PhoneIcon className="mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">{deliveryBoy?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center py-3 border-b">
                  <TruckIcon className="mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-800">
                      {deliveryBoy?.vehicleType} - {deliveryBoy?.vehicleNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center py-3">
                  <IdentificationIcon className="mr-3 w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Driving License</p>
                    <p className="font-medium text-gray-800">{deliveryBoy?.drivingLicense}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="py-3 mt-6 w-full text-white rounded-lg transition bg-primary hover:bg-opacity-90"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
