import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Search, Navigation, Loader } from 'lucide-react'
import { restaurantService } from '../services/api'


const LocationModal = ({ onClose, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [areas, setAreas] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(true)


  // Fetch unique areas from restaurants data
  useEffect(() => {
    loadAreas()
  }, [])


  const loadAreas = async () => {
    try {
      setLoadingAreas(true)
      setLocationError('')
      
      // Fetch all restaurants to get unique areas
      const response = await restaurantService.getRestaurants({ 
        limit: 1000
      })
      
      if (response.success) {
        // Extract unique areas from restaurants
        const uniqueAreas = [...new Set(
          response.data
            .map(restaurant => restaurant.location?.area)
            .filter(area => area && area.trim() !== '')
        )].map((area, index) => ({
          id: index + 1,
          area: area,
          city: 'Vadodara'
        }))


        setAreas(uniqueAreas)
      } else {
        setLocationError('Failed to load areas')
      }
    } catch (error) {
      console.error('Error loading areas:', error)
      setLocationError('Failed to load areas from server')
    } finally {
      setLoadingAreas(false)
    }
  }


  // Reverse geocode coordinates to get area name
  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'QuickBites-Food-Delivery' // Required by Nominatim
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()
      
      console.log('Reverse Geocode Response:', data)

      // Extract area/neighborhood information
      const address = data.address || {}
      
      // Try to find the most specific area name
      const areaName = 
        address.suburb || 
        address.neighbourhood || 
        address.town || 
        address.city_district || 
        address.village || 
        'Current Location'

      return {
        area: areaName,
        city: address.city || address.state_district || 'Vadodara',
        fullAddress: data.display_name,
        latitude,
        longitude
      }

    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Return a default location if geocoding fails
      return {
        area: 'Current Location',
        city: 'Vadodara',
        latitude,
        longitude
      }
    }
  }


  // Get current location with reverse geocoding
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }


    setIsLoading(true)
    setLocationError('')


    try {
      // Get GPS coordinates
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0
        })
      })


      const { latitude, longitude } = position.coords
      
      console.log('GPS Coordinates:', { latitude, longitude })

      // Convert coordinates to address using reverse geocoding
      const locationData = await reverseGeocode(latitude, longitude)
      
      console.log('Detected Location:', locationData)

      // Find matching area from our restaurant areas
      const matchingArea = areas.find(area => 
        area.area.toLowerCase().includes(locationData.area.toLowerCase()) ||
        locationData.area.toLowerCase().includes(area.area.toLowerCase())
      )

      // Use matched area or the detected location
      const finalLocation = matchingArea || {
        id: 'current',
        area: locationData.area,
        city: locationData.city
      }

      // Automatically select this location
      handleLocationSelect(finalLocation)

    } catch (error) {
      setIsLoading(false)
      console.error('Location error:', error)
      
      if (error.code === 1) {
        setLocationError('Location access denied. Please enable location permissions.')
      } else if (error.code === 2) {
        setLocationError('Unable to determine location. Please try again.')
      } else if (error.code === 3) {
        setLocationError('Location request timed out. Please try again.')
      } else {
        setLocationError('Unable to detect location. Please select manually.')
      }
    }
  }, [areas])


  // Filter areas based on search query
  const filteredAreas = areas.filter(location =>
    location.area.toLowerCase().includes(searchQuery.toLowerCase())
  )


  const handleLocationSelect = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location)
    }
    onClose()
  }


  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }


  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.15, ease: "easeOut" }
    },
    exit: { 
      scale: 0.95, 
      opacity: 0,
      transition: { duration: 0.1, ease: "easeIn" }
    }
  }


  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      transition={{ duration: 0.1 }}
      className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Choose Location</h2>
            <p className="text-sm text-gray-600">Select your delivery area in Vadodara</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>


        {/* Search */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search for area in Vadodara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-3 pr-4 pl-10 w-full rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>


        {/* Current Location */}
        <div className="px-6 pb-4">
          <button 
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="flex items-center p-4 space-x-3 w-full rounded-xl border border-gray-200 transition-colors hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
              {isLoading ? (
                <Loader className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Navigation className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">
                {isLoading ? 'Detecting your location...' : 'Use current location'}
              </p>
              <p className="text-sm text-gray-500">
                {locationError || 'Automatically detect your area'}
              </p>
            </div>
          </button>
        </div>


        {/* Error Display */}
        {locationError && (
          <div className="px-6 pb-4">
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {locationError}
            </div>
          </div>
        )}


        {/* Areas List */}
        <div className="px-6 pb-6">
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
            {searchQuery ? 'Search Results' : 'Available Areas'}
          </h3>
          
          {loadingAreas ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 text-orange-500 animate-spin" />
              <span className="ml-3 text-gray-600">Loading areas...</span>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-2 max-h-60">
              {filteredAreas.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className="flex items-center p-3 space-x-3 w-full text-left rounded-lg transition-colors hover:bg-gray-50"
                >
                  <div className="flex justify-center items-center w-8 h-8 bg-orange-100 rounded-full">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{location.area}</p>
                    <p className="text-sm text-gray-500">{location.city}, Gujarat</p>
                  </div>
                </button>
              ))}
            </div>
          )}


          {/* No Results */}
          {!loadingAreas && filteredAreas.length === 0 && searchQuery && (
            <div className="py-8 text-center">
              <div className="mb-3 text-4xl">🔍</div>
              <p className="text-gray-500">No areas found</p>
              <p className="text-sm text-gray-400">Try a different search term</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}


export default LocationModal
