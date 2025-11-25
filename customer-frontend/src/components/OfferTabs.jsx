import { useState } from 'react'
import { motion } from 'framer-motion'

const OfferTabs = ({ offers, applyOffer, closeModal }) => {
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All Offers' },
    { id: 'premium', label: 'Premium' },
    { id: 'cashback', label: 'Cashback' }
  ]

  const filteredOffers = offers.filter(offer => {
    if (activeTab === 'all') return true
    if (activeTab === 'premium') return offer.premium
    if (activeTab === 'cashback') return offer.type === 'Cashback'
    return true
  })

  const handleApplyOffer = (offer) => {
    // Apply the offer using the cart context
    const couponCode = offer.type === 'Flat' ? 'FLAT50' : 
                      offer.type === 'Premium' ? 'SAVE20' : 
                      'FREESHIP'
    
    applyOffer(couponCode)
    closeModal()
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOffers.map((offer) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              offer.premium 
                ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' 
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{offer.title}</h3>
                <p className="text-sm text-gray-600">{offer.description}</p>
              </div>
              {offer.premium && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                  Premium
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mb-4">{offer.expiry}</p>
            
            <button
              onClick={() => handleApplyOffer(offer)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Apply Offer
            </button>
          </motion.div>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No offers available in this category</p>
        </div>
      )}
    </div>
  )
}

export default OfferTabs
