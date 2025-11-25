import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  ChefHat,
  Truck,
  Store,
  MapPin,
  Phone,
  Loader
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useSocket } from '../../context/SocketContext'

const OrderTrackingPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const socket = useSocket()

  // Status configuration with icons and colors
  const statusSteps = [
    {
      key: 'Pending',
      label: 'Order Placed',
      icon: Package,
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600'
    },
    {
      key: 'Accepted',
      label: 'Order Accepted',
      icon: CheckCircle,
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      key: 'Preparing',
      label: 'Preparing Your Food',
      icon: ChefHat,
      color: 'from-orange-400 to-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      key: 'Ready',
      label: 'Ready for Pickup',
      icon: Store,
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      key: 'OutForDelivery',
      label: 'Out for Delivery',
      icon: Truck,
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    }
  ]

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()

      if (data.success) {
        const order = data.data
        setOrderData(order)

        // ✅ Calculate total preparation time from all items
        if (order.items && order.items.length > 0) {
          const totalPrepTime = order.items.reduce((total, item) => {
            // Use item's preparation time or default to 15 minutes
            const itemPrepTime = item.preparationTime || 15
            return total + itemPrepTime
          }, 0)

          // Average prep time + delivery time (estimate 10 min delivery)
          const avgPrepTime = Math.ceil(totalPrepTime / order.items.length)
          setEstimatedTime(avgPrepTime + 10)
        } else {
          setEstimatedTime(30) // Default fallback
        }

        // Calculate elapsed time since order placed
        if (order.orderTime || order.createdAt) {
          const orderTime = new Date(order.orderTime || order.createdAt)
          const now = new Date()
          const elapsed = Math.floor((now - orderTime) / (1000 * 60)) // in minutes
          setElapsedTime(elapsed)
        }
      } else {
        setError('Order not found')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Initial fetch
  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  // ✅ Real-time updates with Socket.io
  useEffect(() => {
    if (socket && orderId) {
      socket.emit('join_order', orderId)

      socket.on('orderStatusUpdated', (data) => {
        console.log('🔔 Order status updated:', data.status)
        setOrderData(prev => ({ ...prev, status: data.status, ...data.updatedOrder }))
      })

      return () => {
        socket.off('orderStatusUpdated')
      }
    }
  }, [socket, orderId])

  // ✅ Update elapsed time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      if (orderData?.orderTime || orderData?.createdAt) {
        const orderTime = new Date(orderData.orderTime || orderData.createdAt)
        const now = new Date()
        const elapsed = Math.floor((now - orderTime) / (1000 * 60))
        setElapsedTime(elapsed)
      }
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [orderData])

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!orderData) return 0
    return statusSteps.findIndex(step => step.key === orderData.status)
  }

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex()
    return ((currentIndex + 1) / statusSteps.length) * 100
  }

  // Get remaining time
  const getRemainingTime = () => {
    const remaining = estimatedTime - elapsedTime
    return remaining > 0 ? remaining : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="mx-auto mb-4 w-12 h-12 text-orange-500 animate-spin" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="mb-4 text-xl text-red-600">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()
  const progressPercentage = getProgressPercentage()
  const remainingTime = getRemainingTime()
  const CurrentIcon = statusSteps[currentStepIndex]?.icon || Package

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />

      <div className="pt-24 pb-16">
        <div className="container px-4 mx-auto max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/orders')}
            className="flex gap-2 items-center mb-6 text-gray-600 transition-colors hover:text-orange-600"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Orders</span>
          </button>

          {/* Page Title with animated icon */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="inline-block mb-4"
            >
              <CurrentIcon className="w-16 h-16 text-orange-500" />
            </motion.div>
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Track Your Order
            </h1>
            <p className="text-gray-600">
              Order #{orderData.orderNumber || orderData._id?.slice(-8)}
            </p>
          </motion.div>

          {/* ✅ Main Tracking Card */}
          <motion.div
            className="p-8 mb-6 bg-white rounded-3xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Restaurant Info */}
            <div className="flex gap-4 items-center pb-6 mb-6 border-b">
              <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <Store className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {orderData.restaurantName || 'Restaurant'}
                </h2>
                <p className="text-sm text-gray-600">
                  {orderData.items?.length || 0} items • ₹{orderData.total || orderData.totalAmount}
                </p>
              </div>
            </div>

            {/* ✅ Time Estimate Card */}
            <div className="p-6 mb-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
              <div className="flex gap-6 justify-center items-center">
                <div className="text-center">
                  <Clock className="mx-auto mb-2 w-8 h-8 text-orange-600" />
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {estimatedTime} min
                  </p>
                </div>
                <div className="w-px h-16 bg-gray-300"></div>
                <div className="text-center">
                  <div className="flex gap-2 justify-center items-center mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Time Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {remainingTime > 0 ? `${remainingTime} min` : 'Almost there!'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* ✅ Status Timeline */}
            <div className="relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const StepIcon = step.icon

                return (
                  <motion.div
                    key={step.key}
                    className="flex relative gap-4 items-start mb-8 last:mb-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Vertical Line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-6 top-14 w-0.5 h-16 transition-colors ${isCompleted ? 'bg-gradient-to-b from-orange-500 to-red-500' : 'bg-gray-200'
                          }`}
                      />
                    )}

                    {/* Icon Circle */}
                    <motion.div
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${isCompleted
                          ? `bg-gradient-to-br ${step.color} border-transparent shadow-lg`
                          : 'bg-white border-gray-300'
                        }`}
                      animate={isCurrent ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(249, 115, 22, 0)',
                          '0 0 0 10px rgba(249, 115, 22, 0.1)',
                          '0 0 0 0 rgba(249, 115, 22, 0)'
                        ]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: isCurrent ? Infinity : 0
                      }}
                    >
                      <StepIcon
                        className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-gray-400'
                          }`}
                      />
                    </motion.div>

                    {/* Status Info */}
                    <div className="flex-1 pt-2">
                      <h3 className={`text-lg font-semibold mb-1 ${isCompleted ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                        {step.label}
                      </h3>

                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-2 items-center"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <p className="text-sm font-medium text-orange-600 animate-pulse">
                            In Progress
                          </p>
                        </motion.div>
                      )}

                      {isCompleted && !isCurrent && (
                        <p className="flex gap-2 items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </p>
                      )}

                      {!isCompleted && !isCurrent && (
                        <p className="text-sm text-gray-400">Pending</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            className="p-6 mb-6 bg-white rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 text-lg font-bold text-gray-800">Order Items</h3>
            <div className="space-y-3">
              {orderData.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <span className="flex justify-center items-center w-8 h-8 text-sm font-bold text-orange-600 bg-orange-100 rounded-lg">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="inline mr-1 w-3 h-3" />
                        {item.preparationTime || 15} min prep time
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Address */}
          {orderData.deliveryAddress && (
            <motion.div
              className="p-6 bg-white rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="flex gap-2 items-center mb-3 text-lg font-bold text-gray-800">
                <MapPin className="w-5 h-5 text-orange-600" />
                Delivery Address
              </h3>
              <p className="text-gray-600">
                {typeof orderData.deliveryAddress === 'string'
                  ? orderData.deliveryAddress
                  : `${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} - ${orderData.deliveryAddress.pincode}`
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default OrderTrackingPage
