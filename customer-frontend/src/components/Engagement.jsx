import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Share2, MessageSquare, Award, TrendingUp } from 'lucide-react'

const Engagement = () => {
  const [stats, setStats] = useState({
    totalOrders: 12547,
    happyCustomers: 8932,
    restaurantPartners: 456,
    averageRating: 4.8,
    deliveryTime: '23 min'
  })

  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      rating: 5,
      comment: 'Amazing food quality and super fast delivery!',
      avatar: '👨‍💼',
      date: '2 days ago'
    },
    {
      id: 2,
      name: 'Priya Sharma', 
      rating: 5,
      comment: 'Love the variety of restaurants available. Great app!',
      avatar: '👩‍💼',
      date: '1 week ago'
    },
    {
      id: 3,
      name: 'Arjun Patel',
      rating: 4,
      comment: 'Good service, could improve delivery time.',
      avatar: '👨‍🎓',
      date: '3 days ago'
    }
  ])

  const engagementFeatures = [
    {
      icon: Heart,
      title: 'Favorite Restaurants',
      description: 'Save your favorite places for quick ordering',
      action: 'Add to Favorites',
      color: 'text-red-500 bg-red-50'
    },
    {
      icon: Share2,
      title: 'Share with Friends',
      description: 'Share delicious meals and earn rewards',
      action: 'Share & Earn',
      color: 'text-blue-500 bg-blue-50'
    },
    {
      icon: Award,
      title: 'Loyalty Program',
      description: 'Earn points with every order you place',
      action: 'Join Program',
      color: 'text-purple-500 bg-purple-50'
    },
    {
      icon: MessageSquare,
      title: 'Rate & Review',
      description: 'Help others discover great food',
      action: 'Write Review',
      color: 'text-green-500 bg-green-50'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thousands of food lovers trust QuickBites for their daily meals
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.totalOrders.toLocaleString()}+
            </div>
            <p className="text-gray-600">Orders Delivered</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.happyCustomers.toLocaleString()}+
            </div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.restaurantPartners}+
            </div>
            <p className="text-gray-600">Restaurant Partners</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
              <span className="text-3xl font-bold text-yellow-600">{stats.averageRating}</span>
            </div>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.deliveryTime}
            </div>
            <p className="text-gray-600">Avg Delivery Time</p>
          </div>
        </motion.div>

        {/* Engagement Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {engagementFeatures.map((feature, index) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                {feature.action}
              </button>
            </div>
          ))}
        </motion.div>

        {/* Customer Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">What Our Customers Say</h3>
            <p className="text-gray-600">Real reviews from real food lovers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{review.avatar}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.name}</h4>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">"{review.comment}"</p>
                <p className="text-sm text-gray-500">{review.date}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Read More Reviews
            </button>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Join QuickBites?</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start your food journey today and discover amazing restaurants in your area
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl">
              Order Now
            </button>
            <button className="border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
              Download App
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Engagement
