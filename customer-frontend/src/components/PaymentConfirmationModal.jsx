import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, X, CreditCard, Clock, Package, Star } from 'lucide-react'

const PaymentConfirmationModal = ({ isOpen, onClose, paymentDetails }) => {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowAnimation(true), 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const {
    orderId = 'ORD12345',
    amount = 450,
    paymentMethod = 'Credit Card',
    transactionId = 'TXN789012345',
    restaurantName = 'Pizza Palace',
    estimatedTime = '25-30 mins',
    loyaltyPoints = 45
  } = paymentDetails || {}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        
        {/* Success Animation */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-8 text-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: showAnimation ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative z-10"
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-green-100">Your order has been confirmed</p>
          </motion.div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
        </div>

        <div className="p-6">
          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Order Details</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID</span>
                <span className="font-semibold text-gray-800">{orderId}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Restaurant</span>
                <span className="font-semibold text-gray-800">{restaurantName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-xl text-green-600">₹{amount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </span>
                <span className="font-semibold text-gray-800">{paymentMethod}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-sm text-gray-800">{transactionId}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Delivery Info</h4>
            </div>
            <p className="text-gray-700 mb-1">Estimated delivery time: <strong>{estimatedTime}</strong></p>
            <p className="text-sm text-gray-600">We'll keep you updated via notifications</p>
          </div>

          {/* Loyalty Points */}
          {loyaltyPoints > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-800">Loyalty Points Earned</h4>
              </div>
              <p className="text-purple-700">
                <strong>{loyaltyPoints} points</strong> added to your account!
              </p>
              <p className="text-sm text-purple-600">Use points for discounts on future orders</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose()
                // Navigate to order tracking
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Track Your Order
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Order confirmation sent to your email
            </p>
            <p className="text-xs text-gray-400">
              Need help? Contact support at{' '}
              <span className="text-blue-600">1800-123-4567</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PaymentConfirmationModal
