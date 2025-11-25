import { Link } from 'react-router-dom'
import { Info, Phone, Mail, HelpCircle, MessageCircle, Book } from 'lucide-react'

const SupportLinks = () => {
  const supportOptions = [
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Find answers to common questions',
      link: '/help',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Phone,
      title: 'Call Support',
      description: 'Speak with our support team',
      link: 'tel:1800-123-4567',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your queries via email',
      link: 'mailto:support@quickbites.com',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      link: '/chat',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      icon: Book,
      title: 'User Guide',
      description: 'Learn how to use QuickBites',
      link: '/guide',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      icon: Info,
      title: 'About Us',
      description: 'Learn more about QuickBites',
      link: '/about',
      color: 'text-gray-600 bg-gray-50'
    }
  ]

  const handleLinkClick = (link) => {
    if (link.startsWith('tel:') || link.startsWith('mailto:')) {
      window.open(link)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Need Help?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportOptions.map((option, index) => (
          <div key={index}>
            {option.link.startsWith('tel:') || option.link.startsWith('mailto:') ? (
              <button
                onClick={() => handleLinkClick(option.link)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg ${option.color} hover:shadow-md transition-all duration-200 text-left`}
              >
                <div className="flex-shrink-0">
                  <option.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm opacity-75">{option.description}</p>
                </div>
              </button>
            ) : (
              <Link
                to={option.link}
                className={`flex items-center gap-4 p-4 rounded-lg ${option.color} hover:shadow-md transition-all duration-200`}
              >
                <div className="flex-shrink-0">
                  <option.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm opacity-75">{option.description}</p>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Contact</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.open('tel:1800-123-4567')}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
            1800-123-4567
          </button>
          <button
            onClick={() => window.open('mailto:support@quickbites.com')}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupportLinks
