import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Package, 
  CreditCard,
  Gift,
  Settings,
  Edit3,
  Save,
  Clock,
  CheckCircle,
  Loader,
  Store
} from 'lucide-react'
import { useUser } from '../../context/UserContext'
import { useCart } from '../../context/CartContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'


const API_BASE_URL = 'http://localhost:5000/api';


const ProfilePage = () => {
  const { user, addresses, updateProfile } = useUser()
  const { lastOrder } = useCart()
  const navigate = useNavigate()


  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Varun Patel',
    email: user?.email || 'varun@example.com',
    phone: user?.phone || '+91 98765 43210',
    joinDate: user?.joinDate || '2023-01-15'
  })

  // Fetch real order history from backend
  const [orderHistory, setOrderHistory] = useState([])
  const [totalOrders, setTotalOrders] = useState(0)


  // Fetch orders from backend
  useEffect(() => {
    fetchRecentOrders()
  }, [])


  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true)
      
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      // Fetch all orders to get total count
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const allOrders = data.data
        setTotalOrders(allOrders.length)
        
        // Get only the 3 most recent orders
        const recentOrders = allOrders
          .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
          .slice(0, 3)
        
        setOrderHistory(recentOrders)
      } else {
        setOrderHistory([])
        setTotalOrders(0)
      }

    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrderHistory([])
      setTotalOrders(0)
    } finally {
      setOrdersLoading(false)
    }
  }


  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateProfile(profileData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
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


  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />
      case 'Out for Delivery': return <Clock className="w-4 h-4" />
      case 'Preparing': return <Clock className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }


  // Calculate average rating from delivered orders
  const calculateAverageRating = () => {
    const ratedOrders = orderHistory.filter(order => order.rating)
    if (ratedOrders.length === 0) return 'N/A'
    const avgRating = ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length
    return avgRating.toFixed(1)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 mb-8 text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl"
          >
            <div className="flex flex-col gap-6 items-center md:flex-row">
              <div className="relative">
                <div className="flex justify-center items-center w-24 h-24 rounded-full backdrop-blur-sm bg-white/20">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="flex absolute right-0 bottom-0 justify-center items-center w-8 h-8 bg-green-500 rounded-full border-4 border-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2 text-3xl font-bold">{profileData.name}</h1>
                <p className="mb-2 text-orange-100">{profileData.email}</p>
                <div className="flex gap-2 justify-center items-center text-orange-100 md:justify-start">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(profileData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <div className="text-sm text-orange-100">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">★ {calculateAverageRating()}</div>
                  <div className="text-sm text-orange-100">Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalOrders * 10}</div>
                  <div className="text-sm text-orange-100">Points</div>
                </div>
              </div>
            </div>
          </motion.div>


          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Profile Information */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 mb-6 bg-white rounded-2xl shadow-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex gap-2 items-center text-orange-600 hover:text-orange-700"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>


                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="flex gap-2 items-center text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{profileData.name}</span>
                      </div>
                    )}
                  </div>


                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="flex gap-2 items-center text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                  </div>


                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="px-3 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="flex gap-2 items-center text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>


                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex gap-2 justify-center items-center py-3 mt-6 w-full font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </motion.div>


              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-white rounded-2xl shadow-lg"
              >
                <h3 className="mb-4 text-lg font-bold text-gray-800">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/addresses')}
                    className="flex gap-3 items-center p-3 w-full text-left rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <span>Manage Addresses</span>
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex gap-3 items-center p-3 w-full text-left rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <Settings className="w-5 h-5 text-orange-500" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => navigate('/rewards')}
                    className="flex gap-3 items-center p-3 w-full text-left rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <Gift className="w-5 h-5 text-orange-500" />
                    <span>Rewards & Offers</span>
                  </button>
                </div>
              </motion.div>
            </div>


            {/* Order History */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-white rounded-2xl shadow-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                  {totalOrders > 3 && (
                    <button
                      onClick={() => navigate('/orders')}
                      className="font-semibold text-orange-600 hover:text-orange-700"
                    >
                      View All ({totalOrders})
                    </button>
                  )}
                </div>


                {ordersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex gap-3 items-center">
                            <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                              <Store className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{order.restaurantName}</h3>
                              <p className="text-sm text-gray-600">Order #{order.orderId}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </div>


                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <div className="flex gap-4 items-center">
                            <span>{order.items?.length || 0} items</span>
                            <span className="font-semibold text-gray-800">₹{order.total}</span>
                            <span>{new Date(order.orderTime).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                          {order.rating && (
                            <div className="flex gap-1 items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-semibold">{order.rating}</span>
                            </div>
                          )}
                        </div>


                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="flex-1 px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                          >
                            View Details
                          </button>
                          {order.restaurant && (
                            <button
                              onClick={() => navigate(`/restaurant/${order.restaurant}`)}
                              className="flex-1 px-4 py-2 font-semibold text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
                            >
                              Reorder
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}


                {!ordersLoading && orderHistory.length === 0 && (
                  <div className="py-12 text-center">
                    <Package className="mx-auto mb-4 w-16 h-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No orders yet</h3>
                    <p className="mb-6 text-gray-500">Start ordering to see your history here</p>
                    <button
                      onClick={() => navigate('/home')}
                      className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>


      <Footer />
    </div>
  )
}


export default ProfilePage
