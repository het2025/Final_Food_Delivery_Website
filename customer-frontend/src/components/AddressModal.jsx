import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, MapPin, Home, Briefcase, Plus } from 'lucide-react'
import { useUser } from '../context/UserContext'

const AddressModal = ({ isOpen, onClose, onSelectAddress }) => {
  const { addresses, addAddress } = useUser()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    houseNo: '',
    street: '',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: ''
  })

  const handleAddAddress = (e) => {
    e.preventDefault()
    const address = {
      ...newAddress,
      id: Date.now(),
      isDefault: addresses.length === 0
    }
    addAddress(address)
    setShowAddForm(false)
    setNewAddress({
      type: 'Home',
      houseNo: '',
      street: '',
      city: 'Vadodara', 
      state: 'Gujarat',
      pincode: ''
    })
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Select Delivery Address</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Current Location Option */}
          <button className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-orange-200 rounded-lg mb-4 hover:border-orange-400 hover:bg-orange-50 transition-colors">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Use current location</p>
              <p className="text-sm text-gray-500">We'll detect your location automatically</p>
            </div>
          </button>

          {/* Saved Addresses */}
          <div className="space-y-3 mb-4">
            {addresses.map((address) => (
              <button
                key={address.id}
                onClick={() => {
                  onSelectAddress(address)
                  onClose()
                }}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {address.type === 'Home' ? (
                    <Home className="w-5 h-5 text-blue-600" />
                  ) : address.type === 'Work' ? (
                    <Briefcase className="w-5 h-5 text-green-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{address.type}</p>
                    {address.isDefault && (
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.houseNo}, {address.street}, {address.city}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Add New Address */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-gray-600 hover:text-orange-600"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Address</span>
            </button>
          ) : (
            <form onSubmit={handleAddAddress} className="space-y-4 border border-gray-200 rounded-lg p-4">
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewAddress(prev => ({ ...prev, type }))}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                      newAddress.type === type
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="House/Flat No."
                value={newAddress.houseNo}
                onChange={(e) => setNewAddress(prev => ({ ...prev, houseNo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />

              <input
                type="text"
                placeholder="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Add Address
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AddressModal
