import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  Clock,
  ShoppingBag,
  MapPin,
  Home as HomeIcon,
  Briefcase,
  Loader,
  CheckCircle
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'

const Cart = () => {
  const navigate = useNavigate()
  
  const cartContext = useCart()
  const userContext = useUser()

  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault?.();
      navigate('/home', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);

   return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  
  if (!cartContext || !userContext) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">Context not available</p>
          <button 
            onClick={() => navigate('/home')}
            className="px-6 py-2 text-white bg-orange-500 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const { 
    cartItems,
    updateQty,
    removeFromCart,
    appliedCoupon, 
    discountAmount, 
    applyCoupon, 
    removeCoupon
  } = cartContext

  const { addresses = [] } = userContext

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  
  // Delivery check modal states
  const [showDeliveryCheck, setShowDeliveryCheck] = useState(false)
  const [deliveryCheckStep, setDeliveryCheckStep] = useState('checking') // 'checking' | 'available' | 'unavailable'

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      setSelectedAddress(defaultAddr)
    }
  }, [addresses, selectedAddress])

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price || 0
    const qty = item.qty || 0
    return sum + (price * qty)
  }, 0)

  const taxes = Math.round(subtotal * 0.05)
  const deliveryFee = 30 // Fixed delivery fee
  const total = subtotal + taxes + deliveryFee - discountAmount

  const handleApplyCoupon = async () => { 
    if (couponCode.trim() && applyCoupon) {
      const result = await applyCoupon(couponCode.trim()); 
      if (result && result.success) {
        setCouponCode('');
      } else {
        alert(result.message || 'Invalid coupon code'); 
      }
    }
  };

  const handleAddressSelection = (addr) => {
    setSelectedAddress(addr)
  }

  const handleProceedToPayment = async () => {
    if (!addresses || addresses.length === 0) {
      alert('Please add a delivery address first')
      navigate('/addresses')
      return
    }

    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }

    // Show delivery check modal
    setShowDeliveryCheck(true)
    setDeliveryCheckStep('checking')

    // Simulate delivery availability check (2-3 seconds)
    setTimeout(() => {
      setDeliveryCheckStep('available')
      
      // After showing available, proceed to payment
      setTimeout(() => {
        setShowDeliveryCheck(false)
        navigate('/payment', {
          state: {
            subtotal,
            taxes,
            deliveryFee,
            total,
            discountAmount,
            deliveryDistance: 5, // Default distance
            deliveryTime: 30,    // Default time
            selectedAddress
          }
        })
      }, 1500) // Show success for 1.5 seconds
    }, 2500) // Check for 2.5 seconds
  }

  if (!cartItems || cartItems.length === 0) {
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
            
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto mb-6 w-24 h-24 text-gray-300" />
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Your cart is empty</h2>
              <p className="mb-8 text-gray-600">Add some delicious items to get started!</p>
              <button
                onClick={() => navigate('/home')}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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

          <h1 className="mb-8 text-3xl font-bold text-gray-800">Your Cart ({cartItems.length} items)</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name || 'Food item'}
                        className="object-cover w-20 h-20 rounded-lg"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg'
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.name || 'Unknown Item'}
                        </h3>
                        <p className="text-gray-600">₹{item.price || 0}</p>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <div className="flex gap-2 items-center text-white bg-orange-500 rounded-lg">
                          <button
                            onClick={() => {
                              const newQty = (item.qty || 1) - 1
                              if (newQty <= 0) {
                                removeFromCart(item._id)
                              } else {
                                updateQty(item._id, newQty)
                              }
                            }}
                            className="flex justify-center items-center w-8 h-8 rounded-l-lg transition-colors hover:bg-orange-600"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="px-3 font-semibold">{item.qty || 1}</span>
                          <button
                            onClick={() => updateQty(item._id, (item.qty || 1) + 1)}
                            className="flex justify-center items-center w-8 h-8 rounded-r-lg transition-colors hover:bg-orange-600"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-2 text-red-500 rounded-lg transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          ₹{(item.price || 0) * (item.qty || 1)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Delivery Address Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-3 items-center">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Delivery Address</h3>
                  </div>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                  >
                    + Add New
                  </button>
                </div>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAddressSelection(addr)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddress === addr
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-lg ${
                            selectedAddress === addr ? 'bg-orange-500 text-white' : 'bg-gray-100'
                          }`}>
                            {addr.type === 'home' && <HomeIcon className="w-4 h-4" />}
                            {addr.type === 'work' && <Briefcase className="w-4 h-4" />}
                            {addr.type === 'other' && <MapPin className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold capitalize">{addr.type}</p>
                            <p className="mt-1 text-sm text-gray-600">
                              {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.landmark && (
                              <p className="mt-1 text-xs text-gray-500">Near: {addr.landmark}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <MapPin className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                    <p className="mb-4 text-gray-600">No delivery address added yet</p>
                    <button
                      onClick={() => navigate('/addresses')}
                      className="px-6 py-2 text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Coupon Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
              >
                <div className="flex gap-3 items-center mb-4">
                  <Tag className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-800">Apply Coupon</h3>
                </div>
                
                {appliedCoupon ? (
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold text-green-600">{appliedCoupon}</span>
                      <span className="text-green-600">applied! You saved ₹{discountAmount}</span>
                    </div>
                    <button
                      onClick={() => removeCoupon && removeCoupon()}
                      className="text-red-500 transition-colors hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-6 py-3 font-semibold text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
              >
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-semibold">₹{taxes}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">₹{deliveryFee}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{discountAmount}</span>
                    </div>
                  )}
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{Math.round(total)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center mt-4 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Estimated delivery: 25-30 mins</span>
                </div>
                
                <button
                  onClick={handleProceedToPayment}
                  className="py-4 mt-6 w-full font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
                >
                  Proceed to Payment
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Check Modal */}
      <AnimatePresence>
        {showDeliveryCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-8 w-full max-w-md text-center bg-white rounded-2xl shadow-2xl"
            >
              {deliveryCheckStep === 'checking' && (
                <>
                  <Loader className="mx-auto mb-4 w-16 h-16 text-orange-500 animate-spin" />
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    Checking Delivery Availability
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we verify if we can deliver to your location...
                  </p>
                </>
              )}

              {deliveryCheckStep === 'available' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <div className="flex justify-center items-center mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    Delivery Available! ✅
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Great! We can deliver to your address.
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to payment...
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Cart
