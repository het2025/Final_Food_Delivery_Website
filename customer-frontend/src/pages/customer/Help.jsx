import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  ArrowLeft,
  Search,
  Clock,
  MapPin,
  CreditCard,
  Package
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const Help = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeAccordion, setActiveAccordion] = useState(null)

  const faqCategories = [
    {
      title: 'Orders & Delivery',
      icon: Package,
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Browse restaurants, select items, add to cart, choose delivery address, select payment method, and confirm your order.'
        },
        {
          question: 'What are the delivery charges?',
          answer: 'Delivery charges vary by distance and restaurant. Free delivery is available on orders above ₹299.'
        },
        {
          question: 'How long does delivery take?',
          answer: 'Most orders are delivered within 25-45 minutes. Exact time depends on restaurant preparation and distance.'
        },
        {
          question: 'Can I track my order?',
          answer: 'Yes! You can track your order in real-time through the "My Orders" section in your account.'
        }
      ]
    },
    {
      title: 'Payments',
      icon: CreditCard,
      faqs: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery (COD).'
        },
        {
          question: 'Is it safe to pay online?',
          answer: 'Yes, all online transactions are secured with bank-grade encryption. We do not store your card details.'
        },
        {
          question: 'When am I charged for my order?',
          answer: 'For online payments, you are charged immediately. For COD, payment is collected upon delivery.'
        }
      ]
    },
    {
      title: 'Account & Profile',
      icon: MapPin,
      faqs: [
        {
          question: 'How do I update my profile?',
          answer: 'Go to Settings > Profile to update your name, email, phone number, and other details.'
        },
        {
          question: 'How do I add/change my address?',
          answer: 'Visit "My Addresses" in your profile to add, edit, or delete delivery addresses.'
        },
        {
          question: 'Can I change my registered mobile number?',
          answer: 'Yes, you can update your mobile number in Profile Settings. Verification may be required.'
        }
      ]
    },
    {
      title: 'Offers & Refunds',
      icon: Clock,
      faqs: [
        {
          question: 'How do I apply a coupon?',
          answer: 'Enter your coupon code in the cart page before checkout. Valid coupons will show instant discount.'
        },
        {
          question: 'What is your refund policy?',
          answer: 'Refunds are processed within 3-5 business days for cancelled or undelivered orders.'
        },
        {
          question: 'How do I get loyalty points?',
          answer: 'Earn points on every order. 1 rupee = 1 point. Use points for discounts on future orders.'
        }
      ]
    }
  ]

  const contactOptions = [
    {
      title: 'Call Us',
      description: 'Speak with our support team',
      icon: Phone,
      action: 'tel:1800-123-4567',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Email Support',
      description: 'Send us your queries',
      icon: Mail,
      action: 'mailto:support@quickbites.com',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Live Chat',
      description: 'Chat with us now',
      icon: MessageCircle,
      action: 'chat',
      color: 'bg-purple-50 text-purple-600'
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

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
            <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
          </div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
              />
            </div>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            {contactOptions.map((option, index) => (
              <button
                key={option.title}
                onClick={() => {
                  if (option.action.startsWith('tel:') || option.action.startsWith('mailto:')) {
                    window.open(option.action)
                  }
                }}
                className={`p-6 rounded-2xl ${option.color} hover:shadow-md transition-all duration-200`}
              >
                <option.icon className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">{option.title}</h3>
                <p className="text-sm opacity-75">{option.description}</p>
              </button>
            ))}
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + categoryIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <category.icon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-800">{category.title}</h2>
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex
                    
                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleAccordion(globalIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                          {activeAccordion === globalIndex ? (
                            <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        {activeAccordion === globalIndex && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-200 bg-gray-50"
                          >
                            <p className="p-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">
                Try different keywords or contact our support team
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => window.open('tel:1800-123-4567')}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Call Support
                </button>
                <button
                  onClick={() => window.open('mailto:support@quickbites.com')}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Email Us
                </button>
              </div>
            </motion.div>
          )}

          {/* Still Need Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-orange-100 mb-6">
              Our friendly support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open('tel:1800-123-4567')}
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Call: 1800-123-4567
              </button>
              <button
                onClick={() => window.open('mailto:support@quickbites.com')}
                className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
              >
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

export default Help
