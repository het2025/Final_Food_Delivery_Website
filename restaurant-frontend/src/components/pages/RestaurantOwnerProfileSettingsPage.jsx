import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Check,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import {
  getCurrentRestaurantOwner,
  updateRestaurantOwnerProfile,
  updateRestaurantOwnerPassword
} from '../../api/restaurantOwnerApi';  // Updated imports for restaurant owner

function RestaurantOwnerProfileSettingsPage() {  // Renamed for consistency
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendError, setBackendError] = useState('');  // Renamed for consistency
  const [successMessage, setSuccessMessage] = useState('');

  const [restaurantOwner, setRestaurantOwner] = useState(null);  // Renamed from vendor
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load restaurant owner profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setBackendError('');

        const res = await getCurrentRestaurantOwner();  // Updated API call

        if (res.success && res.data) {
          setRestaurantOwner(res.data);
          setProfileData({
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || ''
          });
        } else {
          setBackendError(res.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Restaurant owner profile load error:', err);  // Renamed log
        setBackendError(err.message || 'Failed to load restaurant owner profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.name || !profileData.email) {
      setBackendError('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      setBackendError('');
      setSuccessMessage('');

      const res = await updateRestaurantOwnerProfile(profileData);  // Updated API

      if (res.success) {
        setRestaurantOwner(res.data);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setBackendError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Restaurant owner profile update error:', err);  // Renamed log
      setBackendError(err.message || 'Failed to update restaurant owner profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');
    setSuccessMessage('');

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setBackendError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setBackendError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setBackendError('New password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);

      console.log('Submitting restaurant owner password update...');  // Renamed log

      const res = await updateRestaurantOwnerPassword({  // Updated API
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      console.log('Restaurant owner password update response:', res);  // Renamed log

      if (res.success) {
        setSuccessMessage('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setBackendError(res.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Restaurant owner password update error:', err);  // Renamed log
      setBackendError(err.message || 'Failed to update restaurant owner password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      {/* Header (updated title) */}
      <div className="flex gap-4 items-center mb-8">
        <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Restaurant Owner Profile Settings  {/* Updated title */}
          </h1>
          <p className="text-gray-600">Manage your restaurant owner account information</p>
        </div>
      </div>

      {/* Messages */}
      {backendError && (
        <div className="flex gap-2 items-center px-4 py-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
          <AlertCircle size={16} />
          {backendError}
        </div>
      )}
      {successMessage && (
        <div className="flex gap-2 items-center px-4 py-3 mb-4 text-sm text-green-700 bg-green-50 rounded-lg">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <h2 className="flex gap-2 items-center mb-6 text-xl font-semibold text-gray-800">
            <User size={20} className="text-orange-600" />
            Profile Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  placeholder="Your restaurant owner name"
                  className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:opacity-50"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  // onChange={handleProfileChange} // ✅ Email cannot be changed
                  placeholder="your@email.com"
                  className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
                  required
                  disabled={true} // ✅ Read-only
                  readOnly
                />
              </div>
              <p className="mt-1 text-xs text-red-500">
                * Email cannot be changed. Please contact support for assistance.
              </p>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="+91 9876543210"
                  className="py-3 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:opacity-50"
                  disabled={saving}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex gap-2 justify-center items-center px-4 py-3 w-full text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Update Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <h2 className="flex gap-2 items-center mb-6 text-xl font-semibold text-gray-800">
            <Lock size={20} className="text-orange-600" />
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
                />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={restaurantOwner?.email || ''}
                  readOnly
                  hidden
                  aria-hidden="true"
                />
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:opacity-50"
                  required
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600 disabled:opacity-50"
                  disabled={saving}
                >
                  {showPasswords.current ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                New Password
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
                  placeholder="Enter new password (min 6 chars)"
                  autoComplete="new-password"
                  className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:opacity-50"
                  required
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600 disabled:opacity-50"
                  disabled={saving}
                >
                  {showPasswords.new ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Confirm New Password
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
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="py-3 pr-12 pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:opacity-50"
                  required
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-gray-600 disabled:opacity-50"
                  disabled={saving}
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex gap-2 justify-center items-center px-4 py-3 w-full text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RestaurantOwnerProfileSettingsPage;
