import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Phone, User, CheckCircle, Truck, Package, ChefHat } from 'lucide-react'

const LiveTracking = ({ orderId, onClose }) => {
  const [orderStatus, setOrderStatus] = useState({
    current: 2,
    steps: [
      { id: 1, title: 'Order Confirmed', icon: CheckCircle, completed: true, time: '2:30 PM' },
      { id: 2, title: 'Preparing Food', icon: ChefHat, completed: true, time: '2:35 PM' },
      { id: 3, title: 'Out for Delivery', icon: Truck, completed: false, time: 'Est. 3:00 PM' },
      { id: 4, title: 'Delivered', icon: Package, completed: false, time: 'Est. 3:15 PM' }
    ]
  })

  const [deliveryInfo, setDeliveryInfo] = useState({
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    vehicleNumber: 'GJ-05-AB-1234',
    estimatedTime: '15 mins',
    currentLocation: 'Near City Center Mall'
  })

  const [orderDetails] = useState({
    id: orderId || 'ORD12345',
    restaurantName: 'Pizza Palace',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 299 },
      { name: 'Garlic Bread', quantity: 2, price: 149 }
    ],
    total: 448,
    address: '123 Main Street, Alkapuri, Vadodara - 390005'
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate status progression
      setOrderStatus(prev => {
        const newCurrent = Math.min(prev.current + 0.1, 4)
        const newSteps = prev.steps.map(step => ({
          ...step,
          completed: step.id <= Math.floor(newCurrent)
        }))
        return { ...prev, current: newCurrent, steps: newSteps }
      })
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (stepId, completed, current) => {
    if (completed) return 'text-green-500 bg-green-100'
    if (stepId === Math.ceil(current)) return 'text-orange-500 bg-orange-100'
    return 'text-gray-400 bg-gray-100'
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Track Your Order</h2>
            <p className="text-orange-100">Order #{orderDetails.id}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{deliveryInfo.estimatedTime}</div>
            <p className="text-orange-100 text-sm">Estimated Time</p>
          </div>
        </div>
      </div>

      {/* Live Map Placeholder */}
      <div className="bg-gray-100 h-48 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-2" />
            <p className="text-gray-600 font-semibold">{deliveryInfo.currentLocation}</p>
            <p className="text-sm text-gray-500">Live tracking coming soon!</p>
          </div>
        </div>
        
        {/* Animated delivery icon */}
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-4"
        >
          <div className="bg-orange-500 text-white p-3 rounded-full shadow-lg">
            <Truck className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      <div className="p-6">
        {/* Order Status Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Order Status</h3>
          <div className="space-y-4">
            {orderStatus.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(step.id, step.completed, orderStatus.current)}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-500'}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-500">{step.time}</p>
                </div>
                {step.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Delivery Person Info */}
        {orderStatus.current >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Your Delivery Partner
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{deliveryInfo.driverName}</p>
                <p className="text-sm text-gray-600">{deliveryInfo.vehicleNumber}</p>
              </div>
              <button
                onClick={() => window.open(`tel:${deliveryInfo.driverPhone}`)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            </div>
          </motion.div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Order Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{orderDetails.restaurantName}</span>
              <span className="font-semibold text-gray-800">₹{orderDetails.total}</span>
            </div>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                <span className="text-gray-600">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            Delivery Address
          </h4>
          <p className="text-gray-600">{orderDetails.address}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Need Help?
          </button>
          <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200">
            Share Location
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveTracking
