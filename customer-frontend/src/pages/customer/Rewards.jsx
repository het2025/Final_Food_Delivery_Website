import { Gift, Copy, Check } from 'lucide-react'; // Only need Gift, Copy, Check
import { useState, useEffect } from 'react'; // Add useEffect
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useUser } from '../../context/UserContext'; // Import useUser

const dynamicRewardsTiers = [
  { orders: 5, discount: 20, code: 'ORDER20-5', description: '20% off on your next order!', bgColor: 'bg-blue-500' },
  { orders: 10, discount: 25, code: 'ORDER25-10', description: '25% off on your next order!', bgColor: 'bg-green-500' },
  { orders: 15, discount: 30, code: 'ORDER30-15', description: '30% off on your next order!', bgColor: 'bg-purple-500' },
  { orders: 20, discount: 35, code: 'ORDER35-20', description: '35% off on your next order!', bgColor: 'bg-yellow-500' },
  { orders: 30, discount: 40, code: 'ORDER40-30', description: '40% off on your next order!', bgColor: 'bg-red-500' },
  { orders: 40, discount: 50, code: 'ORDER50-40', description: '50% off on your next order!', bgColor: 'bg-pink-500' },
];

const Rewards = () => {
  const { user, refreshUser } = useUser();
  const completedOrdersCount = user?.completedOrdersCount || 0;
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    refreshUser(true); // Silent refresh to avoid global loading flicker/unmount
  }, []); // Refresh user data on mount to get latest order count


  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 seconds
  };

  const calculateStatus = (tierOrders) => {
    if (completedOrdersCount >= tierOrders) {
      return 'unlocked';
    } else {
      return 'pending';
    }
  };

  const getNextTierInfo = () => {
    for (const tier of dynamicRewardsTiers) {
      if (completedOrdersCount < tier.orders) {
        return {
          remaining: tier.orders - completedOrdersCount,
          nextDiscount: tier.discount,
          nextOrders: tier.orders
        };
      }
    }
    return null; // All tiers unlocked
  };

  const nextTier = getNextTierInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20">
        <div className="py-12 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Your Loyalty Rewards
              </h1>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-500">
                Complete orders to unlock exclusive discounts and offers! You've completed
                <span className="font-bold text-orange-600"> {completedOrdersCount} </span>
                orders so far.
              </p>
              {nextTier && (
                <p className="mt-2 text-gray-600 text-md">
                  Complete <span className="font-bold text-orange-600">{nextTier.remaining}</span> more orders to unlock
                  <span className="font-bold text-orange-600"> {nextTier.nextDiscount}% off!</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {dynamicRewardsTiers.map((reward, index) => {
              const status = calculateStatus(reward.orders);
              const isUnlocked = status === 'unlocked';
              const nextOrderToUnlock = reward.orders;
              const ordersRemaining = nextOrderToUnlock - completedOrdersCount;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col overflow-hidden transition-transform duration-300 transform border border-gray-200 shadow-lg rounded-2xl ${isUnlocked ? 'bg-white hover:-translate-y-2' : 'bg-gray-100 opacity-70 cursor-not-allowed'
                    }`}
                >
                  <div className={`p-6 flex items-center justify-center ${reward.bgColor}`}>
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex flex-col flex-grow p-6">
                    <h3 className="mb-2 text-xl font-bold text-gray-800">{reward.discount}% Off!</h3>
                    <p className="flex-grow text-gray-600">{reward.description}</p>
                    <p className="mt-2 text-sm font-medium">
                      Requires: <span className="font-bold">{reward.orders} Orders</span>
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50">
                    {isUnlocked ? (
                      <div
                        onClick={() => handleCopy(reward.code)}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-700 border-2 border-dashed rounded-lg cursor-pointer group hover:border-orange-500 hover:text-orange-600"
                      >
                        {copiedCode === reward.code ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            {reward.code}
                            <Copy className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:scale-110" />
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-200 rounded-lg">
                        Complete {ordersRemaining} more orders to unlock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rewards;
