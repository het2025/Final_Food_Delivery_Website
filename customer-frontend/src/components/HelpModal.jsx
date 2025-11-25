import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Phone, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const HelpModal = ({ isOpen, onClose }) => {
  const [activeAccordion, setActiveAccordion] = useState(null)

  if (!isOpen) return null

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse restaurants, select items, add to cart, choose delivery address, and proceed to payment.'
    },
    {
      question: 'What are the delivery charges?',
      answer: 'Delivery charges vary by distance and restaurant. Free delivery on orders above ₹499.'
    },
    {
      question: 'How can I track my order?',
      answer: 'After placing an order, you can track it in real-time through the "My Orders" section.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Orders can be cancelled within 2 minutes of placing. After that, cancellation depends on restaurant approval.'
    }
  ]

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Help & Support</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Contact Options */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Phone className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-600">Phone</p>
                  <p className="text-sm text-gray-600">1800-123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-600">Email</p>
                  <p className="text-sm text-gray-600">help@quickbites.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-600">Live Chat</p>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    {activeAccordion === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {activeAccordion === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200"
                    >
                      <p className="p-4 text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Help */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you 24/7. Don't hesitate to reach out!
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200">
              Start Live Chat
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default HelpModal
