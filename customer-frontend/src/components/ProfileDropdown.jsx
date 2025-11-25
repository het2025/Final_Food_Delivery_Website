import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Gift,
  ClipboardList,
  X,
  Crown,
  Heart,
  Wallet,
  Award
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import OfferTabs from './OfferTabs'

const ProfileDropdown = ({ onHelpClick, onOrdersClick }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [offersModalOpen, setOffersModalOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { applyOffer } = useCart()

  // Enhanced user data with more details
  const user = {
    name: 'Varun Patel',
    email: 'varun@example.com',
    loyaltyPoints: 1250,
    membershipLevel: 'Gold',
    avatar: null // Using icon instead of image for better performance
  }

  // Enhanced offers with better structure
  const offers = [
    {
      id: 1,
      title: 'Flat ₹50 OFF',
      description: 'on orders above ₹299',
      expiry: 'Expires: 31 Dec 2025',
      type: 'Flat',
      premium: false,
      code: 'FLAT50'
    },
    {
      id: 2,
      title: 'Buy 1 Get 1 Free',
      description: 'on Pizzas',
      expiry: 'Expires: 15 Jan 2026',
      type: 'BOGO',
      premium: false,
      code: 'BOGO'
    },
    {
      id: 3,
      title: '20% OFF',
      description: 'for QuickBites Premium users',
      expiry: 'Expires: 30 Nov 2025',
      type: 'Premium',
      premium: true,
      code: 'PREMIUM20'
    },
    {
      id: 4,
      title: '10% Cashback',
      description: 'on UPI payments',
      expiry: 'Expires: 20 Dec 2025',
      type: 'Cashback',
      premium: false,
      code: 'UPI10'
    }
  ]

  // Enhanced menu items with better organization
  const menuItems = [
    { 
      label: 'My Profile', 
      icon: User, 
      path: '/profile',
      description: 'View and edit profile'
    },
    { 
      label: 'My Orders', 
      icon: ClipboardList, 
      action: () => { 
        onOrdersClick && onOrdersClick()
        setIsOpen(false) 
      },
      description: 'Track your orders'
    },
    { 
      label: 'Wallet & Offers', 
      icon: Gift, 
      action: () => { 
        setOffersModalOpen(true)
        setIsOpen(false) 
      },
      description: 'Coupons and rewards',
      badge: offers.length
    },
    { 
      label: 'Favorites', 
      icon: Heart, 
      path: '/favorites',
      description: 'Your favorite restaurants'
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings',
      description: 'App preferences'
    }
  ]

  // Optimized animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -8
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "tween",
        duration: 0.15,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: -8,
      transition: {
        type: "tween",
        duration: 0.1,
        ease: "easeIn"
      }
    }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween",
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      transition: {
        type: "tween",
        duration: 0.15,
        ease: "easeIn"
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.15,
        ease: "easeOut"
      }
    })
  }

  // Optimized close handler
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleOffersClose = useCallback(() => {
    setOffersModalOpen(false)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (offersModalOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [offersModalOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2 p-2 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md"
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{ willChange: 'transform, background-color' }}
      >
        <div className="relative">
          {/* Enhanced Profile Icon */}
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          {/* Online Status */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          
          {/* Gold Membership Badge */}
          {user.membershipLevel === 'Gold' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        
        {/* User Info - Hidden on mobile */}
        <div className="hidden sm:block text-left">
          <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Award className="w-3 h-3" />
            {user.loyaltyPoints} points
          </p>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 group-hover:text-orange-600 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-orange-100 text-sm">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Wallet className="w-3 h-3" />
                    <span className="text-xs text-orange-100">{user.loyaltyPoints} Points</span>
                    {user.membershipLevel && (
                      <>
                        <Crown className="w-3 h-3" />
                        <span className="text-xs text-orange-100">{user.membershipLevel}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {item.path ? (
                    <Link
                      to={item.path}
                      onClick={handleClose}
                      className="group flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 hover:text-orange-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                          <item.icon className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                        </div>
                        <div>
                          <span className="font-medium">{item.label}</span>
                          {item.description && (
                            <p className="text-xs text-gray-500 group-hover:text-orange-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                      {item.badge && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="group flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 hover:text-orange-700 w-full text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-100 rounded-lg flex items-center justify-center transition-colors">
                          <item.icon className="w-4 h-4 text-gray-600 group-hover:text-orange-600" />
                        </div>
                        <div>
                          <span className="font-medium">{item.label}</span>
                          {item.description && (
                            <p className="text-xs text-gray-500 group-hover:text-orange-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                      {item.badge && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )}
                </motion.div>
              ))}
              
              {/* Logout Button */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link
                  to="/login"
                  onClick={handleClose}
                  className="group flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <span className="font-medium">Sign Out</span>
                    <p className="text-xs text-red-500">See you later!</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Offers Modal */}
      <AnimatePresence>
        {offersModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            style={{ willChange: 'opacity' }}
            onClick={handleOffersClose}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              style={{ willChange: 'transform, opacity' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Available Offers</h2>
                    <p className="text-orange-100 mt-1">Save more on your next order</p>
                  </div>
                  <button
                    onClick={handleOffersClose}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    aria-label="Close Offers Modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <OfferTabs 
                  offers={offers} 
                  applyOffer={applyOffer} 
                  closeModal={handleOffersClose} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDropdown
