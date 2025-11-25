import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Star,
  ArrowLeft,
  Phone,
  MapPin,
  Loader,
  XCircle,
  Store
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'


const API_BASE_URL = 'http://localhost:5000/api';


const Orders = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    fetchOrders()
  }, [activeFilter])


  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      const url = activeFilter === 'All' 
        ? `${API_BASE_URL}/orders/my-orders`
        : `${API_BASE_URL}/orders/my-orders?status=${activeFilter}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      console.log('Orders API Response:', data)

      if (data.success) {
        setOrders(Array.isArray(data.data) ? data.data : [])
      } else {
        setError(data.message || 'Failed to load orders')
        setOrders([])
      }

    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }


  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Cancelled by customer'
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Order cancelled successfully')
        fetchOrders()
      } else {
        alert(data.message)
      }

    } catch (error) {
      console.error('Error cancelling order:', error)
      alert('Failed to cancel order')
    }
  }


  const handleRateOrder = async (orderId, rating) => {
    try {
      const token = localStorage.getItem('token')
      const review = prompt('Write a review (optional):')

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          review
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Thank you for your rating!')
        fetchOrders()
      } else {
        alert(data.message)
      }

    } catch (error) {
      console.error('Error rating order:', error)
      alert('Failed to submit rating')
    }
  }

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };



  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Out for Delivery': return <Truck className="w-5 h-5 text-blue-500" />
      case 'Preparing': return <Clock className="w-5 h-5 text-orange-500" />
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Package className="w-5 h-5 text-gray-500" />
    }
  }


  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800'
      case 'Preparing': return 'bg-orange-100 text-orange-800'
      case 'Confirmed': return 'bg-purple-100 text-purple-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  const filters = ['All', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center pt-20 pb-16 min-h-screen">
          <div className="text-center">
            <Loader className="mx-auto mb-4 w-12 h-12 text-orange-500 animate-spin" />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center mr-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          </div>


          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex overflow-x-auto gap-4 items-center pb-2 mb-8"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50 shadow-md'
                }`}
              >
                {filter}
              </button>
            ))}
          </motion.div>


          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 rounded border border-red-400">
              {error}
            </div>
          )}


          {/* Orders List */}
          <div className="space-y-6">
            <AnimatePresence>
              {orders && orders.length > 0 && orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white rounded-2xl shadow-lg transition-shadow hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-start">
                      {/* Restaurant Icon */}
                      <div className="flex flex-shrink-0 justify-center items-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                        <Store className="w-8 h-8 text-orange-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{order.restaurantName}</h3>
                        <p className="text-sm text-gray-600">Order #{order.orderId}</p>
                        {order.deliveryAddress && (
                          <div className="flex gap-2 items-start mt-2">
                            <MapPin className="mt-0.5 w-4 h-4 text-gray-400 flex-shrink-0" />
                            <p className="text-sm text-gray-500">
                              {order.deliveryAddress.street}, {order.deliveryAddress.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>


                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-gray-500">Items Ordered:</p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {order.items && order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {item.name}</span>
                              <span className="text-gray-600">x {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="mb-2 text-sm font-semibold text-gray-500">Order Details:</p>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p>
                            <span className="text-gray-500">Ordered:</span>{' '}
                            {new Date(order.orderTime).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {order.actualDeliveryTime && (
                            <p>
                              <span className="text-gray-500">Delivered:</span>{' '}
                              {new Date(order.actualDeliveryTime).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          {order.estimatedDeliveryTime && !order.actualDeliveryTime && (
                            <p>
                              <span className="text-gray-500">Estimated:</span>{' '}
                              {new Date(order.estimatedDeliveryTime).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          <p className="pt-2 text-lg font-bold text-orange-600">Total: ₹{order.total}</p>
                        </div>
                      </div>
                    </div>


                    <div className="flex flex-wrap gap-3 mt-4">
                      {/* View Details */}
                      <button
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="flex-1 min-w-[140px] px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                      >
                        View Details
                      </button>
                      
                      {/* ✅ Track Order Button - Only for active orders */}
                      {!['Cancelled', 'Delivered', 'OutForDelivery'].includes(order.status) && (
                        <button
                          onClick={() => handleTrackOrder(order._id)}
                          className="flex gap-2 items-center px-4 py-2 font-semibold text-white bg-green-500 rounded-lg transition-colors hover:bg-green-600"
                        >
                          <Truck className="w-4 h-4" />
                          Track Order
                        </button>
                      )}
                      
                      {/* Cancel Order - Only for pending/preparing orders */}
                      {['Preparing', 'Confirmed', 'Pending', 'Accepted'].includes(order.status) && (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex gap-2 items-center px-4 py-2 font-semibold text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Order
                        </button>
                      )}
                      
                      {/* Call Delivery - Only when out for delivery */}
                      {order.status === 'Out for Delivery' && (
                        <button className="flex gap-2 items-center px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600">
                          <Phone className="w-4 h-4" />
                          Call Delivery
                        </button>
                      )}
                      
                      {/* Show rating if already rated */}
                      {order.status === 'Delivered' && order.rating && (
                        <div className="flex gap-1 items-center px-4 py-2 text-yellow-800 bg-yellow-100 rounded-lg">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{order.rating}</span>
                        </div>
                      )}
                      
                      {/* Rate order - Only for delivered orders without rating */}
                      {order.status === 'Delivered' && !order.rating && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateOrder(order._id, star)}
                              className="transition-transform hover:scale-110"
                              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                              <Star className="w-6 h-6 text-yellow-500 hover:fill-current" />
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Reorder */}
                      {order.restaurant && (
                        <button
                          onClick={() => navigate(`/restaurant/${order.restaurant}`)}
                          className="px-4 py-2 font-semibold text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>


          {/* No Orders Found */}
          {!loading && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Package className="mx-auto mb-4 w-16 h-16 text-gray-300" />
              <h3 className="mb-2 text-xl font-bold text-gray-600">No orders found</h3>
              <p className="mb-6 text-gray-500">
                {activeFilter === 'All' 
                  ? "You haven't placed any orders yet" 
                  : `No orders with status "${activeFilter}"`
                }
              </p>
              <button
                onClick={() => navigate('/home')}
                className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600"
              >
                Start Ordering
              </button>
            </motion.div>
          )}
        </div>
      </div>


      <Footer />
    </div>
  )
}


export default Orders
