import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Home as HomeIcon, 
  Briefcase, 
  Edit2, 
  Trash2,
  X,
  CheckCircle,
  Navigation,
  Loader
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'
import { searchAddress, getCurrentLocation, getAddressFromCoords } from '../../services/locationService'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const Addresses = () => {
  const navigate = useNavigate()
  const { user, addresses = [], addAddress, updateAddress, deleteAddress } = useUser()

  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  })
  const [errors, setErrors] = useState({})
  const [filteredStates, setFilteredStates] = useState([])
  const [showStateDropdown, setShowStateDropdown] = useState(false)
  
  // Location service states
  const [addressSuggestions, setAddressSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [searchingAddress, setSearchingAddress] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'state') {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      if (value.trim()) {
        const filtered = INDIAN_STATES.filter(state =>
          state.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredStates(filtered)
        setShowStateDropdown(filtered.length > 0)
      } else {
        setFilteredStates([])
        setShowStateDropdown(false)
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle address search with OpenStreetMap
  const handleAddressSearch = async (value) => {
    setFormData(prev => ({ ...prev, street: value }))
    
    if (value.length > 2) {
      setSearchingAddress(true)
      const suggestions = await searchAddress(value)
      setAddressSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
      setSearchingAddress(false)
    } else {
      setShowSuggestions(false)
      setAddressSuggestions([])
    }
  }

  // Select suggestion from OpenStreetMap
  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      street: suggestion.detailedStreet || suggestion.placeAddress.split(',')[0],
      city: suggestion.city || 'Vadodara',
      state: suggestion.state || 'Gujarat',
      pincode: suggestion.pincode || '',
      landmark: suggestion.suburb || suggestion.neighbourhood || ''
    }))
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  // Detect user's current location
  const handleDetectLocation = async () => {
    setLoadingLocation(true);
    
    try {
      // Step 1: Get GPS coordinates
      const coords = await getCurrentLocation();
      console.log('GPS coords:', coords);
      
      // Step 2: Get address from backend
      const address = await getAddressFromCoords(coords.lat, coords.lng);
      console.log('Address data:', address);
      
      if (address && address.street) {
        // SUCCESS: Auto-fill the form
        setFormData(prev => ({
          ...prev,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark || ''
        }));
        
        alert('✅ Location detected and address filled automatically!');
      } else {
        // FAILED: Manual entry
        alert('⚠️ Location detected but address not available. Please enter manually.');
        setFormData(prev => ({
          ...prev,
          city: 'Vadodara',
          state: 'Gujarat'
        }));
      }
    } catch (error) {
      console.error('Location error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleStateSelect = (state) => {
    setFormData(prev => ({ ...prev, state }))
    setShowStateDropdown(false)
    setFilteredStates([])
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editingAddress !== null) {
        const addressId = addresses[editingAddress]._id
        await updateAddress(addressId, formData)
      } else {
        await addAddress(formData)
      }
      handleCloseModal()
    } catch (error) {
      alert('Failed to save address. Please try again.')
    }
  }

  const handleEdit = (address, index) => {
    setEditingAddress(index)
    setFormData(address)
    setShowModal(true)
  }

  const handleDelete = async (address) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(address._id)
      } catch (error) {
        alert('Failed to delete address')
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAddress(null)
    setFormData({
      type: 'home',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: false
    })
    setErrors({})
    setFilteredStates([])
    setShowStateDropdown(false)
    setAddressSuggestions([])
    setShowSuggestions(false)
  }

  const getAddressIcon = (type) => {
    switch(type) {
      case 'home': return <HomeIcon className="w-5 h-5" />
      case 'work': return <Briefcase className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-8">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-6 text-gray-600 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Delivery Addresses</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex gap-2 items-center px-6 py-3 font-semibold text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
              Add New Address
            </button>
          </div>

          {/* Address List */}
          {addresses && addresses.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {addresses.map((address, index) => (
                  <motion.div
                    key={address._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="p-3 text-orange-600 bg-orange-100 rounded-lg">
                        {getAddressIcon(address.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex gap-2 items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 capitalize">
                            {address.type}
                          </h3>
                          {address.isDefault && (
                            <span className="flex gap-1 items-center px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Default
                            </span>
                          )}
                        </div>
                        
                        <p className="mb-1 text-gray-700">{address.street}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.landmark && (
                          <p className="mt-1 text-sm text-gray-500">
                            Landmark: {address.landmark}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(address, index)}
                          className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(address)}
                          className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-16 text-center">
              <MapPin className="mx-auto mb-6 w-24 h-24 text-gray-300" />
              <h2 className="mb-4 text-2xl font-bold text-gray-800">No addresses added yet</h2>
              <p className="mb-8 text-gray-600">Add your first delivery address to start ordering</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex gap-2 items-center px-8 py-3 font-semibold text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
              >
                <Plus className="w-5 h-5" />
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex sticky top-0 z-10 justify-between items-center p-6 bg-white border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingAddress !== null ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Detect Location Button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={loadingLocation}
                  className="flex gap-2 justify-center items-center px-4 py-3 w-full font-semibold text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingLocation ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Detect My Current Location
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="flex absolute inset-0 items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="flex relative justify-center text-sm">
                    <span className="px-2 text-gray-500 bg-white">OR</span>
                  </div>
                </div>

                {/* Address Type */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-700">
                    Address Type
                  </label>
                  <div className="flex gap-4">
                    {['home', 'work', 'other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type }))}
                        className={`flex-1 p-4 border-2 rounded-lg capitalize font-medium transition-all ${
                          formData.type === type
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street Address with Autocomplete */}
                <div className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    placeholder="Start typing (e.g., Alkapuri, Sayajigunj)"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {searchingAddress && (
                    <div className="absolute right-3 top-11">
                      <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                    </div>
                  )}
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                  )}
                  
                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="overflow-y-auto absolute z-20 mt-1 w-full max-h-60 bg-white rounded-lg border border-gray-300 shadow-lg">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="p-3 border-b transition-colors cursor-pointer hover:bg-orange-50 last:border-b-0"
                        >
                          <p className="font-medium text-gray-800">{suggestion.placeName}</p>
                          <p className="text-sm text-gray-600">{suggestion.placeAddress}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (formData.state) {
                          const filtered = INDIAN_STATES.filter(state =>
                            state.toLowerCase().includes(formData.state.toLowerCase())
                          )
                          setFilteredStates(filtered)
                          setShowStateDropdown(filtered.length > 0)
                        }
                      }}
                      placeholder="Type to search state"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      autoComplete="off"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                    )}
                    
                    {showStateDropdown && filteredStates.length > 0 && (
                      <div className="overflow-y-auto absolute z-20 mt-1 w-full max-h-60 bg-white rounded-lg border border-gray-300 shadow-lg">
                        {filteredStates.map((state, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleStateSelect(state)}
                            className="px-4 py-2 w-full text-left transition-colors hover:bg-orange-50 hover:text-orange-600"
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
                  )}
                </div>

                {/* Landmark */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark for easy location"
                    className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Set as Default */}
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                    Set as default address
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 font-semibold rounded-lg border border-gray-300 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 font-semibold text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
                  >
                    {editingAddress !== null ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Addresses
