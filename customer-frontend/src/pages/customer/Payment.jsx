import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  DollarSign,
  CheckCircle,
  Loader
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'

const API_BASE_URL = 'http://localhost:5000/api'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useCart()
  const { addresses = [] } = useUser()

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online')
  const [processing, setProcessing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [error, setError] = useState(null)
  const [showDeliveryCheck, setShowDeliveryCheck] = useState(false)
  const [deliveryCheckStep, setDeliveryCheckStep] = useState('checking')

  // Get order details from location state (passed from Cart)
  const {
    subtotal = 0,
    taxes = 0,
    deliveryFee = 0,
    total = 0,
    discountAmount = 0,
    deliveryDistance = 0,
    deliveryTime = 0,
    selectedAddress: passedAddress
  } = location.state || {}

  useEffect(() => {
    // If no cart items or no order data, redirect back to cart
    if (!cartItems || cartItems.length === 0 || !location.state) {
      navigate('/cart')
    }

    // Set address from cart or use default
    if (passedAddress) {
      setSelectedAddress(passedAddress)
    } else if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      setSelectedAddress(defaultAddr)
    }
  }, [cartItems, location.state, navigate, addresses, passedAddress])

  const paymentMethods = [
    {
      id: 'online',
      name: 'UPI / Cards / NetBanking',
      icon: CreditCard,
      description: 'Pay securely with UPI, Credit/Debit Cards, or NetBanking'
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      icon: Wallet,
      description: 'Paytm, PhonePe, Google Pay & more'
    },
    {
      id: 'COD',
      name: 'Cash on Delivery',
      icon: DollarSign,
      description: 'Pay with cash when your order arrives'
    }
  ]

  const handlePayment = async () => {
    if (!addresses || addresses.length === 0) {
      alert('Please add a delivery address first');
      navigate('/addresses');
      return;
    }

    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    setShowDeliveryCheck(true);
    setDeliveryCheckStep('checking');

    setTimeout(async () => {
      setDeliveryCheckStep('available');

      setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');

          if (!token) {
            alert('Please login to continue');
            navigate('/login');
            return;
          }

          console.log('Cart items:', cartItems); // Debug log

          // ✅ FIXED: Prepare order data with STRING customization
          const orderData = {
            items: cartItems.map(item => {
              console.log('Processing item:', item);

              // ✅ Convert customization to string or empty string
              let customizationStr = '';
              if (item.customization) {
                if (Array.isArray(item.customization)) {
                  customizationStr = item.customization.join(', ');
                } else if (typeof item.customization === 'object') {
                  customizationStr = JSON.stringify(item.customization);
                } else {
                  customizationStr = String(item.customization);
                }
              }

              return {
                menuItem: item._id || item.id || null,
                name: item.name || 'Unknown Item',
                price: Number(item.price) || 0,
                quantity: Number(item.qty) || 1,
                image: item.image || '/placeholder.jpg',
                customization: customizationStr // ✅ Always STRING
              };
            }),
            restaurantName: cartItems[0]?.restaurantName ||
              cartItems[0]?.restaurant?.name ||
              'Restaurant',
            restaurantImage: cartItems[0]?.restaurantImage ||
              cartItems[0]?.restaurant?.image ||
              '/placeholder.jpg',
            restaurant: cartItems[0]?.restaurantId ||
              cartItems[0]?.restaurant?._id ||
              null,
            deliveryAddress: {
              street: selectedAddress.street || '',
              city: selectedAddress.city || '',
              state: selectedAddress.state || '',
              pincode: selectedAddress.pincode || '',
              landmark: selectedAddress.landmark || '',
              type: selectedAddress.type || 'home'
            },
            subtotal: Number(subtotal) || 0,
            deliveryFee: Number(deliveryFee) || 0,
            taxes: Number(taxes) || 0,
            discount: Number(discountAmount) || 0,
            total: Number(total) || 0,
            paymentMethod: selectedPaymentMethod,
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60000),
            deliveryDistance: Number(deliveryDistance) || 0,
            deliveryDuration: Number(deliveryTime) || 30,
            instructions: ''
          };

          console.log('🐞 Payload Debug:', {
            subtotal: orderData.subtotal,
            discount: orderData.discount,
            total: orderData.total
          });

          console.log('Sending order data:', orderData);

          const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
          });

          const data = await response.json();
          console.log('Backend response:', data);

          if (data.success) {
            const navOrderData = {
              orderId: data.data._id,
              orderNumber: data.data.orderId || data.data._id,
              items: orderData.items,
              total: orderData.total,
              totalAmount: orderData.total,
              paymentMethod: selectedPaymentMethod,
              estimatedDeliveryTime: data.data.estimatedDeliveryTime || orderData.estimatedDeliveryTime,
              deliveryAddress: orderData.deliveryAddress,
              restaurantName: orderData.restaurantName
            };

            navigate('/order-success', {
              state: navOrderData
            });

            setTimeout(() => {
              if (clearCart) clearCart();
            }, 500);

            setShowDeliveryCheck(false);
          } else {
            throw new Error(data.message || 'Failed to create order');
          }

        } catch (error) {
          console.error('Error creating order:', error);
          setShowDeliveryCheck(false);
          alert('Order failed: ' + error.message);
        }
      }, 1500);
    }, 2500);
  };

  if (!location.state) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-8">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center mb-6 text-gray-600 transition-colors hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Cart
          </button>

          <h1 className="mb-8 text-3xl font-bold text-gray-800">Complete Your Payment</h1>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 rounded-lg border border-red-400">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <div className="p-6 mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-800">Select Payment Method</h2>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === method.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`p-3 rounded-lg ${selectedPaymentMethod === method.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          <method.icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex gap-2 items-center">
                            <h3 className="font-semibold text-gray-800">{method.name}</h3>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className="w-5 h-5 text-orange-500" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedAddress && (
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
                    <button
                      onClick={() => navigate('/addresses')}
                      className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                    >
                      Change
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-800 capitalize">{selectedAddress.type}</p>
                    <p className="mt-2 text-gray-600">
                      {selectedAddress.street}
                    </p>
                    <p className="text-gray-600">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    {selectedAddress.landmark && (
                      <p className="mt-1 text-sm text-gray-600">
                        Landmark: {selectedAddress.landmark}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!selectedAddress && (
                <div className="px-4 py-3 text-yellow-700 bg-yellow-100 rounded-lg border border-yellow-400">
                  <p className="font-semibold">No delivery address selected</p>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="mt-2 font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Add Delivery Address →
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
              >
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cartItems.length})</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-semibold">₹{taxes}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  {deliveryDistance > 0 && (
                    <div className="text-xs text-gray-500">
                      Distance: {deliveryDistance} km • Time: {deliveryTime} mins
                    </div>
                  )}

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

                <button
                  onClick={handlePayment}
                  disabled={processing || !selectedAddress}
                  className="flex gap-2 justify-center items-center py-4 mt-6 w-full font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {selectedPaymentMethod === 'COD' ? 'Place Order' : `Pay ₹${Math.round(total)}`}
                    </>
                  )}
                </button>

                {selectedPaymentMethod === 'COD' && (
                  <p className="mt-3 text-xs text-center text-gray-500">
                    💵 Cash on Delivery - Pay when your order arrives
                  </p>
                )}

                {selectedPaymentMethod === 'online' && (
                  <p className="mt-3 text-xs text-center text-gray-500">
                    🔒 Secure payment powered by Razorpay
                  </p>
                )}
              </motion.div>

              {/* Safety Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Safe & Secure:</span> Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
