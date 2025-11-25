import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  Image as ImageIcon,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('restaurant');

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    image: '',
    cuisine: '',
    gstNumber: '',
    deliveryTime: '',
    priceRange: '',
    location: {
      area: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    contact: {
      phone: '',
      email: ''
    }
  });

  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // ✅ NEW: Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ NEW: Password visibility toggles
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('restaurantOwnerToken');

      // Fetch restaurant profile
      const response = await fetch('http://localhost:5001/api/profile/restaurant', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        const restaurant = data.data;
        setRestaurantData({
          name: restaurant.name || '',
          description: restaurant.description || '',
          image: restaurant.image || '',
          cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : '',
          gstNumber: restaurant.gstNumber || '',
          deliveryTime: restaurant.deliveryTime || '',
          priceRange: restaurant.priceRange || '',
          location: {
            area: restaurant.location?.area || '',
            address: restaurant.location?.address || '',
            city: restaurant.location?.city || '',
            state: restaurant.location?.state || '',
            pincode: restaurant.location?.pincode || ''
          },
          contact: {
            phone: restaurant.contact?.phone || '',
            email: restaurant.contact?.email || ''
          }
        });
      }

      // Fetch owner data
      const ownerResponse = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const ownerResult = await ownerResponse.json();
      if (ownerResult.success && ownerResult.data) {
        setOwnerData({
          name: ownerResult.data.name || '',
          email: ownerResult.data.email || '',
          phone: ownerResult.data.phone || ''
        });
      }

    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setRestaurantData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value
        }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setRestaurantData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    } else {
      setRestaurantData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ NEW: Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ NEW: Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('restaurantOwnerToken');

      const response = await fetch('http://localhost:5001/api/profile/restaurant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...restaurantData,
          cuisine: restaurantData.cuisine.split(',').map(c => c.trim()).filter(c => c)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Restaurant profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving restaurant:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOwner = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('restaurantOwnerToken');

      const response = await fetch('http://localhost:5001/api/profile/owner', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ownerData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Owner information updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update information');
      }
    } catch (err) {
      console.error('Error saving owner:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ✅ NEW: Handle password change submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('restaurantOwnerToken');

      const response = await fetch('http://localhost:5001/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your restaurant and account information</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex gap-2 items-center p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex gap-2 items-center p-4 mb-6 text-green-700 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* ✅ UPDATED: Tabs - Added Password Tab */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'restaurant'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building className="inline-block mr-2 w-4 h-4" />
          Restaurant Details
        </button>
        <button
          onClick={() => setActiveTab('owner')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'owner'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="inline-block mr-2 w-4 h-4" />
          Owner Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="inline-block mr-2 w-4 h-4" />
          Change Password
        </button>
      </div>

      {/* Restaurant Tab */}
      {activeTab === 'restaurant' && (
        <form onSubmit={handleSaveRestaurant} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={restaurantData.name}
                  onChange={handleRestaurantChange}
                  required
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex gap-2 items-center mb-2 text-sm font-medium text-gray-700">
                  <ImageIcon size={16} />
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={restaurantData.image}
                  onChange={handleRestaurantChange}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={restaurantData.description}
                onChange={handleRestaurantChange}
                rows={3}
                className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  name="cuisine"
                  value={restaurantData.cuisine}
                  onChange={handleRestaurantChange}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Italian, Chinese"
                />
              </div>

              <div>
                <label className="flex gap-2 items-center mb-2 text-sm font-medium text-gray-700">
                  <Clock size={16} />
                  Delivery Time (mins)
                </label>
                <input
                  type="text"
                  name="deliveryTime"
                  value={restaurantData.deliveryTime}
                  onChange={handleRestaurantChange}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex gap-2 items-center mb-2 text-sm font-medium text-gray-700">
                  <DollarSign size={16} />
                  Price Range
                </label>
                <select
                  name="priceRange"
                  value={restaurantData.priceRange}
                  onChange={handleRestaurantChange}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="₹">₹ - Budget</option>
                  <option value="₹₹">₹₹ - Moderate</option>
                  <option value="₹₹₹">₹₹₹ - Premium</option>
                  <option value="₹₹₹₹">₹₹₹₹ - Fine Dining</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={restaurantData.gstNumber}
                onChange={handleRestaurantChange}
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                <MapPin size={20} />
                Location Details
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Area *</label>
                  <input
                    type="text"
                    name="location.area"
                    value={restaurantData.location.area}
                    onChange={handleRestaurantChange}
                    required
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={restaurantData.location.city}
                    onChange={handleRestaurantChange}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Address *</label>
                  <textarea
                    name="location.address"
                    value={restaurantData.location.address}
                    onChange={handleRestaurantChange}
                    required
                    rows={2}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="location.state"
                    value={restaurantData.location.state}
                    onChange={handleRestaurantChange}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">PIN Code</label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={restaurantData.location.pincode}
                    onChange={handleRestaurantChange}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                <Phone size={20} />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="contact.phone"
                    value={restaurantData.contact.phone}
                    onChange={handleRestaurantChange}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="contact.email"
                    value={restaurantData.contact.email}
                    onChange={handleRestaurantChange}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex gap-2 items-center px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Restaurant Details
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Owner Tab */}
      {activeTab === 'owner' && (
        <form onSubmit={handleSaveOwner} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={ownerData.name}
                onChange={handleOwnerChange}
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={ownerData.email}
                disabled
                className="px-4 py-3 w-full bg-gray-100 rounded-lg border border-gray-300 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={ownerData.phone}
                onChange={handleOwnerChange}
                className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex gap-2 items-center px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Owner Information
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ✅ NEW: Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  required
                  disabled={saving}
                  className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                  disabled={saving}
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                New Password *
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                  autoComplete="new-password"
                  required
                  disabled={saving}
                  className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                  disabled={saving}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters</p>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  required
                  disabled={saving}
                  className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600"
                  disabled={saving}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex gap-2 items-center px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfileSettings;
