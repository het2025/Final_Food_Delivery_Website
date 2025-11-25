import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Clock, Phone, Mail } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const RefundPolicy = () => {
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
            <h1 className="text-3xl font-bold text-gray-800">Refund Policy</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg mb-6">
                At QuickBites, we're committed to ensuring your complete satisfaction with every order. If you're not happy with your food delivery experience, we're here to make it right.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-orange-500" />
                Refund Eligibility
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Order Cancellation:</strong> Full refund if cancelled within 5 minutes of placing the order</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Quality Issues:</strong> Full or partial refund for damaged, incorrect, or poor quality food</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Delivery Issues:</strong> Refund available for significantly delayed or undelivered orders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Missing Items:</strong> Refund or replacement for missing items from your order</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Refund Process & Timeline
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Report Issue</h3>
                    <p className="text-sm text-gray-600">Contact us within 24 hours of delivery</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Review</h3>
                    <p className="text-sm text-gray-600">We review your case within 2 hours</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Refund</h3>
                    <p className="text-sm text-gray-600">Refund processed in 3-5 business days</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Refund Methods</h2>
              <div className="space-y-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Original Payment Method</h3>
                  <p className="text-gray-600">Refunds are processed back to your original payment method (card, UPI, wallet)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">QuickBites Credits</h3>
                  <p className="text-gray-600">Get instant credits in your QuickBites wallet for faster future orders</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">Important Notes</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <ul className="space-y-2 text-gray-700">
                  <li>• Refund requests must be submitted within 24 hours of delivery</li>
                  <li>• Partial consumption may affect refund eligibility</li>
                  <li>• Bank processing times may vary (3-7 business days)</li>
                  <li>• Screenshots or photos may be required for quality issues</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Need Help with a Refund?</h2>
            <p className="text-orange-100 mb-6">Our customer support team is here to assist you 24/7</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open('tel:1800-123-4567')}
                className="flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call: 1800-123-4567
              </button>
              <button
                onClick={() => window.open('mailto:support@quickbites.com')}
                className="flex items-center justify-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email Support
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default RefundPolicy
