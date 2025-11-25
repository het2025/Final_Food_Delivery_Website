import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Users, AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const Terms = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 text-sm mb-6">Last updated: September 13, 2025</p>
              
              <p className="text-gray-700 text-lg mb-8">
                Welcome to QuickBites! These Terms of Service govern your use of our food delivery platform. By using our services, you agree to these terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                User Agreement
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>You must be at least 18 years old to use QuickBites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>You are responsible for maintaining the security of your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>You agree to provide accurate and up-to-date information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>You will not use our platform for any illegal or unauthorized purposes</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Description</h2>
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  QuickBites is a food delivery platform that connects you with local restaurants. We facilitate orders and coordinate delivery but are not directly responsible for food preparation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Our Role</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Platform and app operation</li>
                      <li>• Order processing and tracking</li>
                      <li>• Customer support</li>
                      <li>• Payment processing</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Restaurant Role</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Food preparation and quality</li>
                      <li>• Order accuracy</li>
                      <li>• Food safety compliance</li>
                      <li>• Menu and pricing updates</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Terms</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <ul className="space-y-3 text-gray-700">
                  <li>• All prices are inclusive of applicable taxes</li>
                  <li>• Payment is required at the time of order placement (except COD)</li>
                  <li>• We accept various payment methods as displayed during checkout</li>
                  <li>• Delivery charges and service fees are clearly disclosed</li>
                  <li>• Promotional codes and discounts are subject to terms and conditions</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Order and Delivery</h2>
              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Order Acceptance</h3>
                  <p className="text-gray-600">Orders are subject to availability and restaurant acceptance. We reserve the right to cancel orders in exceptional circumstances.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Delivery Times</h3>
                  <p className="text-gray-600">Estimated delivery times are approximate and may vary due to weather, traffic, or high demand.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                Limitation of Liability
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  QuickBites acts as an intermediary between customers and restaurants. Our liability is limited as follows:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• We are not responsible for food quality, taste, or preparation</li>
                  <li>• Food allergies and dietary restrictions are the customer's responsibility</li>
                  <li>• We are not liable for any health issues resulting from food consumption</li>
                  <li>• Maximum liability is limited to the order value</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-500" />
                Privacy and Data
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Please review our{' '}
                  <button
                    onClick={() => navigate('/privacy')}
                    className="text-purple-600 hover:text-purple-800 underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                  {' '}for detailed information about how we collect, use, and protect your personal data.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• We collect necessary information to provide our services</li>
                  <li>• Your data is protected with industry-standard security measures</li>
                  <li>• We do not sell your personal information to third parties</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Changes to Terms</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700">
                  We may update these Terms of Service from time to time. We will notify users of significant changes through the app or email. Continued use of our services after changes constitutes acceptance of the new terms.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <div className="border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>📧 Email: legal@quickbites.com</p>
                  <p>📞 Phone: 1800-123-4567</p>
                  <p>📍 Address: QuickBites Legal Team, Vadodara, Gujarat, India</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Terms
