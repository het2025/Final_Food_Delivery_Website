import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Search = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filteredResults, setFilteredResults] = useState([])
  const [showClear, setShowClear] = useState(false)

  // Sample restaurants data
  const restaurants = [
    { id: 1, name: 'Pizza Palace', cuisine: 'Italian' },
    { id: 2, name: 'Biryani House', cuisine: 'Indian' },
    { id: 3, name: 'Chinese Delight', cuisine: 'Chinese' },
    { id: 4, name: 'Burger Hub', cuisine: 'American' },
    { id: 5, name: 'Sweet Tooth', cuisine: 'Desserts' }
  ]

  useEffect(() => {
    if (query.length > 0) {
      const results = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredResults(results)
      setShowClear(true)
    } else {
      setFilteredResults([])
      setShowClear(false)
    }
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="search"
            placeholder="Search restaurants, cuisines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 pl-14 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />

          {showClear && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-8">
          {filteredResults.length > 0 ? (
            <ul className="divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              {filteredResults.map((restaurant) => (
                <li
                  key={restaurant.id}
                  className="p-4 hover:bg-orange-50 cursor-pointer transition-all"
                  onClick={() => navigate(`/menu/${restaurant.id}`)}
                >
                  <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
                  <p className="text-gray-600">{restaurant.cuisine}</p>
                </li>
              ))}
            </ul>
          ) : query ? (
            <p className="text-gray-500 text-center mt-6">No results found for "{query}"</p>
          ) : (
            <p className="text-gray-500 text-center mt-6">Start typing to search restaurants and cuisines</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Search
