import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  Heart,
  SlidersHorizontal,
  X,
  Loader,
  ChevronDown,
  Check,
  ArrowUpDown
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { restaurantService } from '../../services/api'
import RestaurantCard from '../../components/RestaurantCard'

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Applied filters (what's actually being used)
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: 'all',
    minRating: 0,
    maxDeliveryTime: 60,
    cuisines: [],
    deliveryFee: 'all',
    offers: false,
    features: [],
    distance: 10
  })
  
  // Temporary filters (what user is selecting)
  const [tempFilters, setTempFilters] = useState({
    priceRange: 'all',
    minRating: 0,
    maxDeliveryTime: 60,
    cuisines: [],
    deliveryFee: 'all',
    offers: false,
    features: [],
    distance: 10
  })
  
  // Dynamic data states
  const [restaurants, setRestaurants] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRestaurants, setTotalRestaurants] = useState(0)
  const [availableCuisines, setAvailableCuisines] = useState([])
  const [availableFeatures] = useState([
    'Free Delivery', 'Fast Delivery', 'Promoted', 'New', 'Discount Available'
  ])

  const sortOptions = [
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
    { value: 'deliveryTime', label: 'Fastest Delivery', icon: '🚀' },
    { value: 'newest', label: 'Newest First', icon: '✨' },
    { value: 'priceLowToHigh', label: 'Price: Low to High', icon: '💰' },
    { value: 'priceHighToLow', label: 'Price: High to Low', icon: '💎' }
  ]

  // Load restaurants and cuisines
  useEffect(() => {
    loadRestaurants()
    loadCuisines()
  }, [currentPage, sortBy, searchQuery, appliedFilters])

  const loadCuisines = async () => {
    try {
      const response = await restaurantService.getCuisines()
      if (response.success) {
        setAvailableCuisines(response.data)
      }
    } catch (error) {
      console.error('Error loading cuisines:', error)
    }
  }

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: currentPage,
        limit: 20,
        sortBy: sortBy
      };

      // Add search query
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // --- Add all applied filters to the params object ---
      
      // Price Range
      if (appliedFilters.priceRange !== 'all') {
        if (appliedFilters.priceRange === 'budget') params.priceRange = '₹';
        if (appliedFilters.priceRange === 'mid') params.priceRange = '₹₹';
        if (appliedFilters.priceRange === 'premium') params.priceRange = '₹₹₹';
      }
      
      // Minimum Rating
      if (appliedFilters.minRating > 0) {
        params.minRating = appliedFilters.minRating;
      }
      
      // Max Delivery Time
      if (appliedFilters.maxDeliveryTime < 60) {
        params.maxDeliveryTime = appliedFilters.maxDeliveryTime;
      }
      
      // Cuisines
      if (appliedFilters.cuisines.length > 0) {
        params.cuisines = appliedFilters.cuisines.join(',');
      }
      
      // Features
      if (appliedFilters.features.length > 0) {
        params.features = appliedFilters.features.join(',');
      }

      // Delivery Fee
      if (appliedFilters.deliveryFee !== 'all') {
        params.deliveryFee = appliedFilters.deliveryFee;
      }

      // Offers
      if (appliedFilters.offers) {
        params.offers = appliedFilters.offers;
      }

      const response = await restaurantService.getRestaurants(params)
      
      if (response.success) {
        setRestaurants(response.data)
        setTotalPages(response.totalPages)
        setTotalRestaurants(response.total)
      } else {
        setError('Failed to load restaurants')
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
      setError('Failed to load restaurants. Please check your backend server.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadRestaurants()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleFavorite = (restaurantId) => {
    setFavorites(prev =>
      prev.includes(restaurantId)
        ? prev.filter(id => id !== restaurantId)
        : [...prev, restaurantId]
    )
  }

  // Apply filters function
  const applyFilters = () => {
    setAppliedFilters({ ...tempFilters })
    setCurrentPage(1)
    setShowFilters(false)
  }

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      priceRange: 'all',
      minRating: 0,
      maxDeliveryTime: 60,
      cuisines: [],
      deliveryFee: 'all',
      offers: false,
      features: [],
      distance: 10
    }
    setTempFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    resetFilters()
    setSortBy('popular')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.priceRange !== 'all') count++
    if (appliedFilters.minRating > 0) count++
    if (appliedFilters.maxDeliveryTime < 60) count++
    if (appliedFilters.cuisines.length > 0) count++
    if (appliedFilters.deliveryFee !== 'all') count++
    if (appliedFilters.offers) count++
    if (appliedFilters.features.length > 0) count++
    if (appliedFilters.distance < 10) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Toggle cuisine selection
  const toggleCuisine = (cuisine) => {
    setTempFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }))
  }

  // Toggle feature selection
  const toggleFeature = (feature) => {
    setTempFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  // Render pagination buttons
  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 transition-colors bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
    )

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentPage === i
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      )
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 transition-colors bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    )

    return pages
  }

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader className="w-16 h-16 mx-auto mb-4 text-orange-500 animate-spin" />
            <p className="text-gray-600">Loading restaurants...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="py-16 text-white bg-gradient-to-r from-orange-500 to-red-500">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:max-w-2xl"            
            >
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                Discover Amazing Restaurants
              </h1>
        
              <p className="mb-10 text-xl opacity-90">
                Find your favorite cuisines delivered fast to your doorstep
              </p>
        
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2"
                />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full py-4 pl-12 pr-20 text-gray-800 placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button
                  onClick={handleSearch}
                  className="absolute px-6 py-2 text-white transition-colors -translate-y-1/2 bg-orange-600 right-3 top-1/2 rounded-xl hover:bg-orange-700"
                >
                  Search
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 mb-6 text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
              <button 
                onClick={loadRestaurants}
                className="ml-4 underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Filters and Sort Section */}
          <div className="flex items-center justify-between mb-8">
            {/* Left side - Filters */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-3 transition-colors bg-white border border-gray-300 shadow-sm rounded-xl hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Right side - Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors shadow-sm min-w-[200px]"
              >
                <ArrowUpDown className="w-5 h-5 text-gray-600" />
                <span className="flex-1 font-medium text-left text-gray-700">
                  {sortOptions.find(opt => opt.value === sortBy)?.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Sort Dropdown */}
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 z-20 w-64 mt-2 overflow-hidden bg-white border border-gray-200 shadow-lg top-full rounded-xl"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value)
                          setCurrentPage(1)
                          setShowSortDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          sortBy === option.value ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                        {sortBy === option.value && (
                          <Check className="w-4 h-4 ml-auto text-orange-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            {/* <h2 className="text-2xl font-bold text-gray-800">
              {totalRestaurants} restaurants found
            </h2> */}
            {searchQuery && (
              <p className="mt-1 text-gray-600">
                Results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Restaurant Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-white shadow-lg rounded-2xl animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                    <div className="flex justify-between">
                      <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                      <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-2xl font-bold text-gray-800">No restaurants found</h3>
              <p className="mb-6 text-gray-600">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 font-semibold text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {restaurants.map((restaurant, index) => (
                  <RestaurantCard restaurant={restaurant} index={index} key={restaurant._id} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                {renderPagination()}
              </div>
            </div>
          )}

          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="mt-4 text-center text-gray-600">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalRestaurants)} of {totalRestaurants} restaurants
            </div>
          )}
        </div>
      </div>

      {/* Smart Filter Overlay */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowFilters(false)}
            />
            
            {/* Filter Panel */}
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full overflow-y-auto bg-white shadow-2xl w-96"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                      Price Range
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Prices' },
                        { value: 'budget', label: 'Budget (₹) - Under ₹200' },
                        { value: 'mid', label: 'Mid-range (₹₹) - ₹200-₹500' },
                        { value: 'premium', label: 'Premium (₹₹₹) - Above ₹500' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            value={option.value}
                            checked={tempFilters.priceRange === option.value}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                      Minimum Rating: {tempFilters.minRating}+ ⭐
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={tempFilters.minRating}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Any</span>
                      <span>5 stars</span>
                    </div>
                  </div>

                  {/* Delivery Time */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                      Max Delivery Time: {tempFilters.maxDeliveryTime} mins
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      step="5"
                      value={tempFilters.maxDeliveryTime}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, maxDeliveryTime: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>15 min</span>
                      <span>60 min</span>
                    </div>
                  </div>

                  {/* Cuisines */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                      Cuisines
                    </label>
                    <div className="space-y-2 overflow-y-auto max-h-40">
                      {availableCuisines.map((cuisine) => (
                        <label key={cuisine} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempFilters.cuisines.includes(cuisine)}
                            onChange={() => toggleCuisine(cuisine)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{cuisine}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                      Delivery Fee
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'Any delivery fee' },
                        { value: 'free', label: 'Free delivery only' },
                        { value: 'low', label: 'Under ₹50' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            value={option.value}
                            checked={tempFilters.deliveryFee === option.value}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, deliveryFee: e.target.value }))}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                      Restaurant Features
                    </label>
                    <div className="space-y-2">
                      {availableFeatures.map((feature) => (
                        <label key={feature} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tempFilters.features.includes(feature)}
                            onChange={() => toggleFeature(feature)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Offers Toggle */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempFilters.offers}
                        onChange={(e) => setTempFilters(prev => ({ ...prev, offers: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Show only restaurants with offers</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 mt-8 border-t border-gray-200">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-3 font-semibold text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close sort dropdown */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSortDropdown(false)}
        />
      )}

      <Footer />
    </div>
  )
}

export default Restaurants
