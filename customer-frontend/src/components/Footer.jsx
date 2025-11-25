import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Branding Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/quickbite_logo.svg"
                alt="QuickBites Logo"
                className="object-contain w-16 h-8"
              />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                QuickBite
              </span>
            </div>
            <p className="text-sm text-gray-400">
              QuickBite – Your favorite meals, delivered fast.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/restaurants"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/help#faqs"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/help#contact"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-gray-400 transition-colors duration-200 hover:text-white"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/quickbites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors duration-200 transform hover:text-blue-500 hover:scale-110"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://instagram.com/quickbites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors duration-200 transform hover:text-pink-500 hover:scale-110"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://twitter.com/quickbites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors duration-200 transform hover:text-blue-400 hover:scale-110"
              >
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 mt-8 text-center border-t border-gray-800">
          <p className="text-sm text-gray-400">
            © 2025 QuickBites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
