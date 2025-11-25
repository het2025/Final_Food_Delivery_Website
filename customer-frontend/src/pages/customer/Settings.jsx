import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  CreditCard, 
  User,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const Settings = () => {
  const navigate = useNavigate()
  const { logout } = useUser()
  
  const [settings, setSettings] = useState({
    notifications: {
      orderUpdates: true,
      offers: true,
      newsletter: false,
      sms: true
    },
    preferences: {
      darkMode: false,
      language: 'English',
      currency: 'INR'
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false
    }
  })

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const settingsGroups = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about your order status' },
        { key: 'offers', label: 'Offers & Promotions', description: 'Receive special offers and deals' },
        { key: 'newsletter', label: 'Newsletter', description: 'Weekly food recommendations' },
        { key: 'sms', label: 'SMS Notifications', description: 'Receive SMS for important updates' }
      ]
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        { key: 'darkMode', label: 'Dark Mode', description: 'Switch to dark theme' },
        { key: 'language', label: 'Language', description: 'Choose your preferred language', type: 'select' },
        { key: 'currency', label: 'Currency', description: 'Display prices in your currency', type: 'select' }
      ]
    },
    {
      title: 'Privacy',
      icon: Shield,
      items: [
        { key: 'profileVisibility', label: 'Profile Visibility', description: 'Control who can see your profile', type: 'select' },
        { key: 'dataSharing', label: 'Data Sharing', description: 'Share data to improve recommendations' }
      ]
    }
  ]

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
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          </div>

          <div className="space-y-8">
            {settingsGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <group.icon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-bold text-gray-800">{group.title}</h2>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      
                      <div className="ml-4">
                        {item.type === 'select' ? (
                          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                            {item.key === 'language' && (
                              <>
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Gujarati</option>
                              </>
                            )}
                            {item.key === 'currency' && (
                              <>
                                <option>INR</option>
                                <option>USD</option>
                              </>
                            )}
                            {item.key === 'profileVisibility' && (
                              <>
                                <option>Public</option>
                                <option>Private</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <button
                            onClick={() => handleToggle(group.title.toLowerCase(), item.key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[group.title.toLowerCase()]?.[item.key] 
                                ? 'bg-orange-500' 
                                : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[group.title.toLowerCase()]?.[item.key] 
                                  ? 'translate-x-6' 
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Account</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 rounded-lg px-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-800">Edit Profile</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate('/payment-methods')}
                  className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 rounded-lg px-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-800">Payment Methods</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-3 text-left hover:bg-red-50 rounded-lg px-3 transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Sign Out</span>
                </button>

                <button className="w-full flex items-center gap-3 py-3 text-left hover:bg-red-50 rounded-lg px-3 transition-colors text-red-600">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-semibold">Delete Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Settings
