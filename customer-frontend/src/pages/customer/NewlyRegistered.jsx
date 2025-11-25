import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Star, MapPin, ChevronRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function NewlyRegistered() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewlyRegistered();
  }, []);

  const fetchNewlyRegistered = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching newly registered restaurants...');

      const response = await fetch('http://localhost:5000/api/restaurants/newly-registered');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📊 API Response:', data);

      if (data.success) {
        setRestaurants(data.data || []);
        console.log(`✅ Loaded ${data.data.length} restaurants`);
      } else {
        throw new Error(data.message || 'Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('❌ Error fetching newly registered:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    // Navigate to restaurant menu page
    navigate(`/menu/${restaurant.restaurantId || restaurant._id}`, {
      state: { restaurant }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-orange-600 animate-spin border-t-transparent"></div>
            <p className="text-lg text-gray-600">Loading new restaurants...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="p-8 max-w-md text-center bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">Error Loading Restaurants</h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={fetchNewlyRegistered}
              className="px-6 py-2 text-white bg-orange-500 rounded-lg transition-colors hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-12 text-center"
          >
            <div className="flex gap-3 justify-center items-center mb-4">
              <Sparkles className="w-10 h-10 text-orange-600 animate-pulse" />
              <h1 className="text-4xl font-bold text-gray-900">
                Newly Registered Restaurants
              </h1>
              <Sparkles className="w-10 h-10 text-orange-600 animate-pulse" />
            </div>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover fresh restaurants that just joined QuickBite! Be the first to try their delicious food 🎉
            </p>
            <div className="inline-flex gap-2 items-center px-4 py-2 mt-4 text-green-700 bg-green-100 rounded-full">
              <span className="font-semibold">{restaurants.length}</span>
              <span>new restaurants available</span>
            </div>
          </motion.div>

          {/* Restaurants Grid */}
          {restaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 mx-auto max-w-2xl text-center bg-white rounded-2xl shadow-lg"
            >
              <div className="flex justify-center items-center mx-auto mb-6 w-24 h-24 bg-gray-100 rounded-full">
                <Store className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-gray-700">
                No New Restaurants Yet
              </h3>
              <p className="mb-6 text-gray-500">Check back soon for exciting new additions!</p>
              <button
                onClick={() => navigate('/restaurants')}
                className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600"
              >
                Browse All Restaurants
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleRestaurantClick(restaurant)}
                  className="overflow-hidden bg-white rounded-2xl shadow-lg transition-all duration-300 transform cursor-pointer hover:shadow-2xl hover:-translate-y-2"
                >
                  {/* Image Section */}
                  <div className="overflow-hidden relative h-56 bg-gray-200">
                    {restaurant.image && restaurant.image.trim() !== '' ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="object-cover w-full h-full transition-transform duration-500 transform hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'flex justify-center items-center w-full h-full bg-gradient-to-br from-orange-400 to-red-500';
                          fallback.innerHTML = `
                            <div class="p-4 text-center text-white">
                              <svg class="mx-auto mb-2 w-16 h-16 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <p class="text-sm font-semibold">${restaurant.name}</p>
                            </div>
                          `;
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div className="flex justify-center items-center w-full h-full bg-gradient-to-br from-orange-400 to-red-500">
                        <div className="p-4 text-center text-white">
                          <Store className="mx-auto mb-2 w-16 h-16 opacity-70" />
                          <p className="text-sm font-semibold">{restaurant.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* New Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex gap-2 items-center px-4 py-2 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg animate-bounce">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-bold">NEW</span>
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/50"></div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 line-clamp-1">
                      {restaurant.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">
                      {restaurant.description || 'Delicious food awaits you!'}
                    </p>

                    {/* Cuisine Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.cuisine?.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                      {restaurant.cuisine?.length > 3 && (
                        <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                          +{restaurant.cuisine.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="flex justify-between items-center mb-4 text-sm">
                      <div className="flex gap-1 items-center text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.deliveryTime || '30'} mins</span>
                      </div>
                      
                      <div className="flex gap-1 items-center text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">
                          {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      
                      <span className="font-bold text-orange-600">
                        {restaurant.priceRange || '₹₹'}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex gap-2 items-start mb-4 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">
                        {restaurant.location?.area}, {restaurant.location?.city}
                      </span>
                    </div>

                    {/* Registration Date */}
                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-green-600">
                          🎉 Joined {new Date(restaurant.registeredAt || restaurant.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {restaurants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-8 mt-12 text-center bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl"
            >
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                Support New Restaurants! 🍽️
              </h3>
              <p className="mx-auto mb-6 max-w-xl text-gray-600">
                Help new restaurant partners grow by being their first customer. 
                Your order makes a huge difference!
              </p>
              <button
                onClick={() => navigate('/restaurants')}
                className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg transition-all duration-200 hover:from-orange-600 hover:to-red-600 hover:shadow-xl"
              >
                Explore All Restaurants
              </button>
            </motion.div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NewlyRegistered;
