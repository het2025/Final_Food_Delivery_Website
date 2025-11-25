import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Store, MapPin, Clock, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerRestaurantOwner } from '../api/restaurantOwnerApi';

function RestaurantOwnerRegisterModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Owner Details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Restaurant Details
    restaurantName: '',
    description: '',
    cuisine: '',
    
    // Location Details
    area: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Additional Details
    deliveryTime: '30',
    priceRange: '₹₹',
    image: '',
    gstNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields (Name, Email, Phone, Password)');
      return;
    }

    if (!formData.restaurantName) {
      setError('Restaurant name is required');
      return;
    }

    if (!formData.area || !formData.address || !formData.city || !formData.pincode) {
      setError('Please fill in complete restaurant location details');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ ENHANCED: Send complete restaurant data
      const response = await registerRestaurantOwner({
        // Owner info
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        
        // Restaurant info
        restaurant: {
          name: formData.restaurantName,
          description: formData.description || `Welcome to ${formData.restaurantName}`,
          cuisine: formData.cuisine ? formData.cuisine.split(',').map(c => c.trim()) : ['Multi-Cuisine'],
          location: {
            area: formData.area,
            address: formData.address,
            city: formData.city,
            state: formData.state || 'Gujarat',
            pincode: formData.pincode,
            coordinates: [0, 0]
          },
          contact: {
            phone: formData.phone,
            email: formData.email
          },
          deliveryTime: formData.deliveryTime,
          priceRange: formData.priceRange,
          image: formData.image || '',
          gstNumber: formData.gstNumber || '',
          status: 'active',
          isActive: true
        }
      });

      if (response.success && response.token) {
        localStorage.setItem('restaurantOwnerToken', response.token);
        setSuccess(true);

        setTimeout(() => {
          onClose();
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Restaurant owner registration error:', err);
      setError(err.message || 'Registration failed. Please check if backend is running on port 5001');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/40">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition hover:text-gray-600"
          disabled={isSubmitting}
        >
          <X size={22} />
        </button>

        <h2 className="mb-2 text-3xl font-bold text-center text-orange-600">
          Register Your Restaurant 🍴
        </h2>
        <p className="mb-6 text-sm text-center text-gray-600">
          Join QuickBite and start accepting orders today!
        </p>

        {/* Success Message */}
        {success && (
          <div className="flex gap-2 items-center p-4 mb-4 text-green-700 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle size={20} />
            <span>Registration successful! Redirecting to dashboard...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex gap-2 items-center p-4 mb-4 text-red-700 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {isSubmitting ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full border-4 border-orange-500 animate-spin border-t-transparent" />
            <p className="text-lg font-medium text-gray-700">
              Creating your account and restaurant profile...
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Section 1: Owner Account Details */}
            <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-orange-600 rounded-full">
                  1
                </div>
                Owner Account Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Ritesh Agrwal"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="e.g., 29ABCDE1234F1Z5"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Restaurant Details */}
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-blue-600 rounded-full">
                  2
                </div>
                Restaurant Details
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="flex gap-2 items-center mb-1 text-sm font-medium text-gray-700">
                    <Store size={16} />
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="e.g., Pizza Mountain"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your restaurant and what makes it special..."
                    rows="3"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Cuisine Type
                  </label>
                  <input
                    type="text"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    placeholder="e.g., Italian, Chinese, Indian"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple cuisines with commas</p>
                </div>

                <div>
                  <label className="flex gap-2 items-center mb-1 text-sm font-medium text-gray-700">
                    <ImageIcon size={16} />
                    Restaurant Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/restaurant.jpg"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="flex gap-2 items-center mb-1 text-sm font-medium text-gray-700">
                    <Clock size={16} />
                    Avg Delivery Time (mins)
                  </label>
                  <input
                    type="number"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    placeholder="30"
                    min="10"
                    max="120"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="flex gap-2 items-center mb-1 text-sm font-medium text-gray-700">
                    <IndianRupee size={16} />
                    Price Range
                  </label>
                  <select
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="₹">₹ - Budget Friendly</option>
                    <option value="₹₹">₹₹ - Moderate</option>
                    <option value="₹₹₹">₹₹₹ - Premium</option>
                    <option value="₹₹₹₹">₹₹₹₹ - Fine Dining</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Location Details */}
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                <div className="flex justify-center items-center w-8 h-8 text-sm font-bold text-white bg-green-600 rounded-full">
                  3
                </div>
                <MapPin size={20} />
                Restaurant Location
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Area/Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., Alkapuri"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Vadodara"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Shop/Building No., Street name, Landmark"
                    rows="2"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g., Gujarat"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g., 390007"
                    maxLength="6"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex gap-2 items-start text-sm text-gray-600">
                <input type="checkbox" className="mt-1" required />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-orange-600 hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-orange-600 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="py-4 w-full text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg transition hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Register Restaurant & Start Selling'}
            </button>

            {/* Login Link */}
            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="font-medium text-orange-600 hover:underline"
              >
                Login here
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestaurantOwnerRegisterModal;
