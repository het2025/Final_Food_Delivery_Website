import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LocationModal from './LocationModal'
import HelpModal from './HelpModal'
import { useCart } from '../context/CartContext'
import { Sparkles } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { 
  ShoppingCart, 
  Search, 
  X, 
  Menu, 
  LogOut, 
  User, 
  UserCircle, 
  Heart, 
  Clock, 
  Settings,
  Home,
  Store
} from 'lucide-react'
import { useUser } from '../context/UserContext'

const Header = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('Vadodara, GJ')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const profileDropdownRef = useRef(null)
  const { cartItems } = useCart()
  const { user, logoutUser } = useUser()
  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const openLocationModal = () => setIsLocationModalOpen(true)
  const closeLocationModal = () => setIsLocationModalOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleFoodiesClick = () => {
    if (location.pathname === '/') {
      window.location.reload()
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setShowSearchResults(true)
  }

  const handleLocationSelect = (locationData) => {
    if (locationData.area === 'Current Location') {
      setSelectedLocation('Current Location')
    } else {
      setSelectedLocation(`${locationData.area}, ${locationData.city}`)
    }
    localStorage.setItem('selectedLocation', JSON.stringify(locationData))
    console.log('Location selected:', locationData)
  }

  useEffect(() => {
    const savedLocation = localStorage.getItem('selectedLocation')
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation)
        if (locationData.area === 'Current Location') {
          setSelectedLocation('Current Location')
        } else {
          setSelectedLocation(`${locationData.area}, ${locationData.city}`)
        }
      } catch (error) {
        console.error('Error parsing saved location:', error)
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      logoutUser()
      setIsProfileOpen(false)
      navigate('/')
      console.log('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'border-b border-gray-100 shadow-lg backdrop-blur-md bg-white/95' 
          : 'bg-white border-b border-gray-100 shadow-sm'
      }`}>
        {/* ✅ CHANGED: Removed max-w-7xl constraint, using full width with padding */}
        <div className="px-4 w-full sm:px-6 lg:px-8">
          <div className="flex gap-4 justify-between items-center h-16">

            {/* Left Side: Logo and Location */}
            <div className="flex flex-shrink-0 gap-3 items-center">
              {/* Logo - Compact */}
              <Link
                to="/"
                onClick={handleFoodiesClick}
                className="flex gap-2 items-center group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-50 blur-md transition-opacity group-hover:opacity-75"></div>
                  <img
                    src="/quickbite_logo.svg"
                    alt="QuickBites Logo"
                    className="object-contain relative z-10 w-16 h-8 rounded-lg transition-transform group-hover:scale-110"
                  />
                </div>
                <span className="hidden text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 sm:inline">
                  QUICKBITES
                </span>
              </Link>

              {/* Location - Compact */}
              <button
                onClick={openLocationModal}
                className="hidden gap-3 items-center px-5 py-3 text-base text-gray-700 rounded-xl transition-all duration-200 lg:flex hover:text-orange-500 hover:bg-orange-50 group"
              >
                <svg className="flex-shrink-0 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs leading-tight text-gray-500">Deliver to</p>
                  <p className="text-base font-semibold truncate max-w-32">{selectedLocation}</p>
                </div>
              </button>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden gap-2 items-center lg:flex">
              <Link 
                to="/"
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                  location.pathname === '/' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>

              <Link 
                to="/restaurants"
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                  location.pathname === '/restaurants' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <Store className="w-4 h-4" />
                Restaurants
              </Link>

              <Link 
                to="/newly-registered"
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                  location.pathname === '/newly-registered' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden xl:inline">Newly Registered</span>
                <span className="xl:hidden">New</span>
                <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full">
                  New
                </span>
              </Link>
            </nav>

            {/* Right Side: Search, Actions */}
            <div className="flex flex-shrink-0 gap-2 items-center">
              {/* Search - Compact */}
              {/* <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg w-48 lg:w-56 xl:w-64 hover:bg-gray-100 transition-colors">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food"
                  className="flex-1 text-sm placeholder-gray-400 bg-transparent outline-none"
                />
                <button type="submit" className="text-gray-500 transition-colors hover:text-orange-500">
                  <Search className="w-4 h-4" />
                </button>
              </form> */}

              {/* Notifications */}
              {/* <div className="hidden lg:block">
                <NotificationDropdown />
              </div> */}

              {/* Cart - Compact */}
              <Link
                to="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-orange-500 border-2 border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden text-sm font-semibold sm:inline">Cart</span>
                {totalQty > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full px-1">
                    {totalQty}
                  </span>
                )}
              </Link>

              {/* Profile - Compact */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-orange-50 transition-all duration-200"
                  >
                    <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md">
                      <span className="text-xs font-bold text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden text-left xl:block">
                      <p className="text-xs font-semibold leading-tight text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">Profile</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 z-50 py-2 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-2xl"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex gap-3 items-center">
                            <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                              <span className="text-sm font-bold text-white">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <UserCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">My Profile</span>
                          </Link>

                          <Link
                            to="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">My Orders</span>
                          </Link>

                          <Link
                            to="/addresses"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">Addresses</span>
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-medium">Settings</span>
                          </Link>

                          <div className="pt-1 mt-1 border-t border-gray-100">
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm font-medium">Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="p-2 text-gray-700 rounded-lg transition-colors lg:hidden hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={toggleMobileMenu}></div>
          <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-gray-800">Menu</span>
                <button 
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Location */}
                <button
                  onClick={() => {
                    openLocationModal()
                    toggleMobileMenu()
                  }}
                  className="flex gap-3 items-center p-3 w-full text-gray-700 rounded-lg hover:bg-orange-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-500 truncate">{selectedLocation}</p>
                  </div>
                </button>

                {/* Newly Registered */}
                <Link
                  to="/newly-registered"
                  onClick={toggleMobileMenu}
                  className="flex gap-3 items-center p-3 w-full text-gray-700 rounded-lg hover:bg-orange-50"
                >
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Newly Registered</span>
                  <span className="px-2 py-0.5 text-xs font-bold text-white bg-green-500 rounded-full ml-auto">
                    New
                  </span>
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  onClick={toggleMobileMenu}
                  className="flex justify-between items-center p-3 w-full text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"
                >
                  <div className="flex gap-3 items-center">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">Cart</span>
                  </div>
                  {totalQty > 0 && (
                    <span className="px-3 py-1 text-sm font-bold text-orange-500 bg-white rounded-full">
                      {totalQty}
                    </span>
                  )}
                </Link>

                {/* User Profile Links */}
                {user && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex gap-3 items-center p-3 mb-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                          <span className="text-lg font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={toggleMobileMenu}
                        className="flex gap-3 items-center p-3 w-full text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <UserCircle className="w-5 h-5" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={toggleMobileMenu}
                        className="flex gap-3 items-center p-3 w-full text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <Clock className="w-5 h-5" />
                        <span>My Orders</span>
                      </Link>

                      <button
                        onClick={() => {
                          handleSignOut()
                          toggleMobileMenu()
                        }}
                        className="flex gap-3 items-center p-3 w-full text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLocationModalOpen && (
        <LocationModal 
          onClose={closeLocationModal} 
          onLocationSelect={handleLocationSelect}
        />
      )}
      {isHelpModalOpen && <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />}
    </>
  )
}

export default Header
