import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const Privacy = () => {
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
            <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 text-sm mb-6">Last updated: September 13, 2025</p>
              
              <p className="text-gray-700 text-lg mb-8">
                Your privacy is important to us. This Privacy Policy explains how QuickBites collects, uses, discloses, and safeguards your information when you use our food delivery platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-500" />
                Information We Collect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3">Personal Information</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Name and contact details</li>
                    <li>• Email address and phone number</li>
                    <li>• Delivery addresses</li>
                    <li>• Date of birth (optional)</li>
                    <li>• Profile preferences</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-3">Usage Information</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Order history and preferences</li>
                    <li>• App usage and navigation data</li>
                    <li>• Device information and IP address</li>
                    <li>• Location data (with permission)</li>
                    <li>• Payment transaction details</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-green-500" />
                How We Use Your Information
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Service Delivery</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Process and fulfill your orders</li>
                      <li>• Coordinate delivery services</li>
                      <li>• Handle payments and refunds</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Personalization</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Recommend restaurants and dishes</li>
                      <li>• Customize app experience</li>
                      <li>• Send relevant offers and promotions</li>
                      <li>• Improve our services</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Information Sharing</h2>
              <div className="space-y-4 mb-8">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-600 mb-3">✅ What We Share</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Order details with restaurants for fulfillment</li>
                    <li>• Delivery information with delivery partners</li>
                    <li>• Anonymous analytics data for service improvement</li>
                    <li>• Information required by law or regulation</li>
                  </ul>
                </div>
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="font-semibold text-red-600 mb-3">❌ What We DON'T Share</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• We never sell your personal information</li>
                    <li>• No sharing with unauthorized third parties</li>
                    <li>• No marketing emails from external companies</li>
                    <li>• No access to your payment card details</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-purple-500" />
                Data Security
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700 mb-4">
                  We implement robust security measures to protect your personal information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      🔒
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Encryption</h4>
                    <p className="text-sm text-gray-600">All data is encrypted in transit and at rest</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      🛡️
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Secure Servers</h4>
                    <p className="text-sm text-gray-600">Protected servers with regular security updates</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      👁️
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Access Control</h4>
                    <p className="text-sm text-gray-600">Limited access to authorized personnel only</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-orange-500" />
                Your Rights and Choices
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Data Rights</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Access your personal data</li>
                      <li>• Update or correct information</li>
                      <li>• Delete your account and data</li>
                      <li>• Download your data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Communication Choices</h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Opt out of marketing emails</li>
                      <li>• Control push notifications</li>
                      <li>• Manage location sharing</li>
                      <li>• Update privacy preferences</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white border border-orange-300 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    <strong>To exercise your rights:</strong> Visit your account settings or contact us at 
                    <a href="mailto:privacy@quickbites.com" className="text-orange-600 hover:underline"> privacy@quickbites.com</a>
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Cookies and Tracking</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-800">Essential Cookies:</strong>
                      <span className="text-gray-600"> Required for basic functionality</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-800">Analytics Cookies:</strong>
                      <span className="text-gray-600"> Help us understand usage patterns</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-800">Preference Cookies:</strong>
                      <span className="text-gray-600"> Remember your choices and settings</span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Children's Privacy</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700">
                  QuickBites is intended for users aged 18 and above. We do not knowingly collect personal information from children under 18. If you believe we have collected such information, please contact us immediately.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Changes to This Policy</h2>
              <div className="border border-gray-200 rounded-lg p-6 mb-8">
                <p className="text-gray-700">
                  We may update this Privacy Policy periodically. We will notify you of significant changes through the app, email, or by posting a notice on our website. Your continued use of our services after such modifications constitutes acceptance of the updated policy.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Us</h2>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Privacy Team</p>
                    <p>📧 privacy@quickbites.com</p>
                    <p>📞 1800-123-4567</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Mailing Address</p>
                    <p>QuickBites Privacy Office</p>
                    <p>Vadodara, Gujarat, India</p>
                  </div>
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

export default Privacy
