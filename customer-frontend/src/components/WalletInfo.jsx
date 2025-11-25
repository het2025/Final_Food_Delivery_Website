import { useState, useEffect } from 'react'
import { Wallet, CreditCard, Gift, TrendingUp, Plus, History } from 'lucide-react'
import { motion } from 'framer-motion'

const WalletInfo = () => {
  const [balance, setBalance] = useState(1200)
  const [loyaltyPoints, setLoyaltyPoints] = useState(450)
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'credit', amount: 50, description: 'Cashback from order #12345', date: '2025-01-10' },
    { id: 2, type: 'debit', amount: 299, description: 'Order payment - Pizza Palace', date: '2025-01-09' },
    { id: 3, type: 'credit', amount: 100, description: 'Referral bonus', date: '2025-01-08' }
  ])

  const [coupons, setCoupons] = useState([
    { id: 1, code: 'FLAT50', description: '₹50 Off on orders above ₹299', expiry: '31 Dec 2025' },
    { id: 2, code: 'BOGO', description: 'Buy 1 Get 1 Free on Pizzas', expiry: '15 Jan 2026' },
    { id: 3, code: 'SAVE20', description: '20% Off for Premium users', expiry: '28 Feb 2026' }
  ])

  useEffect(() => {
    // Fetch balance, points, coupons from API or context
  }, [])

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">My Wallet</h2>
          <Wallet className="w-8 h-8" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-orange-100 text-sm mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold">₹{balance}</p>
          </div>
          <div>
            <p className="text-orange-100 text-sm mb-1">Loyalty Points</p>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-300" />
              <p className="text-3xl font-bold">{loyaltyPoints}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-white bg-opacity-20 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-30 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Money
          </button>
          <button className="flex-1 bg-white text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{transaction.description}</p>
                  <p className="text-gray-500 text-xs">{transaction.date}</p>
                </div>
              </div>
              <p className={`font-bold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
              </p>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 text-orange-600 hover:text-orange-700 font-semibold py-2">
          View All Transactions
        </button>
      </motion.div>

      {/* Coupons & Offers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">My Coupons</h3>
          <Gift className="w-5 h-5 text-orange-500" />
        </div>

        <div className="space-y-3">
          {coupons.map(coupon => (
            <div key={coupon.id} className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">{coupon.code}</span>
                    <span className="text-xs text-gray-500">Expires {coupon.expiry}</span>
                  </div>
                  <p className="text-sm text-gray-700">{coupon.description}</p>
                </div>
                <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
                  Use Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-center">
          <h4 className="font-semibold text-gray-800 mb-2">Loyalty Rewards</h4>
          <p className="text-sm text-gray-600 mb-3">
            You have <strong>{loyaltyPoints} points</strong>. Redeem 100 points for ₹10 off!
          </p>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
            Redeem Points
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default WalletInfo
