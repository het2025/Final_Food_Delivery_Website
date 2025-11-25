import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, Plus, Loader, TrendingUp } from 'lucide-react';
import { restaurantService } from '../../services/api';
import HeroSection from '../../components/HeroSection';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import RestaurantCard from '../../components/RestaurantCard';


const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDish, setSelectedDish] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');


  // Dish keywords mapping from your JSON data
  const dishKeywords = {
    "Pizza": [
      "Paneer Tikka Pizza", "Margherita Pizza", "Farmhouse Pizza", "Chicken Tikka Pizza", 
      "Pepperoni Pizza", "Pizza Margherita", "Pizza Quattro Stagioni", "Pizza Napoletana", 
      "Pizza Vegetariana", "Pizza Diavola", "Chicken Pizza", "Pizza Quattro Formaggi", 
      "Pizza Prosciutto e Funghi", "BBQ Chicken Pizza", "Meat Lovers Pizza", "Pizza Bianca", 
      "Tandoori Pizza", "Mushroom Pizza", "Corn & Cheese Pizza", "Chicken BBQ Pizza", 
      "Butter Chicken Pizza", "Quattro Stagioni Pizza", "Vegetable Supreme", "Cheese Burst Pizza", 
      "Mediterranean Pizza", "Healthy Quinoa Pizza", "Pizza Counter", "Keema Pizza", 
      "Rock Special Pizza", "Cheese Pizza", "Hawaiian Pizza", "Four Cheese Pizza", 
      "Tandoori Chicken Pizza", "Chana Masala Pizza", "Seekh Kebab Pizza", "Punjabi Pizza", 
      "South Indian Pizza", "Gujarati Pizza", "Rajasthani Pizza", "Pav Bhaji Pizza", 
      "Vada Pav Pizza", "Bhel Puri Pizza", "Chole Bhature Pizza", "Teal Special Pizza"
    ],
    "Pav Bhaji": [
      "Pav Bhaji", "Pav Bhaji Pizza"
    ],
    "Sev Usal": [
      "Mahakali Special Sev Usal", "Regular Sev Usal", "Extra Sev Usal", "Sev Usal with Pav", "Famous Sev Usal"
    ],
    "Rolls": [
      "Peking Duck Rolls", "Samosa Spring Rolls", "Spring Rolls", "Khandvi", "Egg Roll", 
      "Duck Spring Rolls", "Frankie Roll", "Schezwan Roll", "Chicken Enchiladas", 
      "Asian Fusion Spring Rolls", "Chicken Seekh Roll", "Mutton Boti Roll", "Chicken Tikka Roll", 
      "Chicken Malai Tikka Roll", "Chicken Reshmi Roll", "Paneer Tikka Roll", "Paneer Malai Roll", 
      "Mushroom Tikka Roll", "Vegetable Seekh Roll", "Chicken Cheese Roll", "Double Chicken Roll", 
      "Egg Chicken Roll", "Achari Chicken Roll", "Khandvi Spicy", "Fresh Rotli"
    ],
    "Vada Pav": [
      "Classic Vada Pav", "Butter Vada Pav", "Cheese Vada Pav", "Schezwan Vada Pav", 
      "Fried Vada Pav", "Vada Pav", "Tasty Special Vada Pav", "Mumbai Style Vada Pav", 
      "Double Vada Pav", "Batata Vada", "Dry Garlic Chutney", "Masala Tea"
    ],
    "Samosa": [
      "Deconstructed Samosa", "Chocolate Samosa", "Samosa Spring Rolls", "Samosa", "Samosa Chaat"
    ],
    "Burger": [
      "Classic Chicken Burger", "Veg Burger", "Cheese Burger", "Chicken Cheese Burger", 
      "Paneer Burger", "Chicken Burger", "Veggie Burger", "Paneer Tikka Sliders", 
      "Masala Burger", "Grilled Portobello Burger", "Classic Beef Burger", "Tikka Masala Burger", 
      "Paneer Bhurji Burger", "BBQ Pulled Pork Burger", "Quinoa Veggie Burger", 
      "Brewery Signature Burger", "BBQ Bacon Burger", "Mushroom Swiss Burger", 
      "Classic Cheeseburger", "Paneer Tikka Burger", "Crispy Aloo Burger", "Mexican Bean Burger", "Egg Burger"
    ],
    "Biryani": [
      "Biryani Paella", "Sunset Biryani", "Vegetable Biryani", "Chicken Biryani", 
      "Murgh Biryani", "Gosht Biryani", "Biryani Bowl", "Hyderabadi Chicken Biryani", 
      "Mutton Biryani", "Mexican Biryani", "Kalaghoda Special Biryani", "Fish Biryani", 
      "Prawn Biryani", "Deconstructed Biryani"
    ],
    "Cakes": [
      "Gulab Jamun Cheesecake", "Masala Fish Cakes", "Cheesecake", "Date Pancakes", 
      "Dhokla", "Chocolate Lava Cake", "Opera Cake", "Handvo", "Idli Sambar", "Pancakes", 
      "Appam with Stew", "Puttu with Kadala", "Malpua", "Kulfi Cheesecake", "Uttapam", 
      "Pancakes Stack", "Cheesecake Slice", "Sugar-Free Cake", "Rava Idli", "Onion Uttapam", 
      "Chocolate Lava Cake Supreme", "Khaman", "New York Cheesecake", "Unicorn Pancakes", 
      "Rainbow Cheesecake", "Edible Flower Cake", "Continental Desserts", "Choco Lava Cake", 
      "Sev Khamni", "Fresh Dhokla", "Spicy Dhokla", "Birthday Celebration Cake"
    ],
    "Chinese": [
      "Chilli Paneer", "Yang Chow Fried Rice", "Indo-Chinese Momos", "Lunch Buffet", 
      "Chinese Stir Fry", "Chinese Tea", "Hot & Sour Soup"
    ],
    "Dosa": [
      "Masala Dosa", "Plain Dosa", "Rava Dosa", "Dosa Plain", "Set Dosa", 
      "Special Breakfast Combo", "Mysore Masala Dosa", "Paper Dosa", "Rava Masala Dosa", 
      "Ghee Roast Dosa", "Cheese Dosa", "Traveler's Combo"
    ],
    "Shakes": [
      "Chocolate Shake", "Vanilla Shake", "Chocolate Milkshake", "Strawberry Shake"
    ],
    "Pasta": [
      "Garden Pasta", "Vegetable Lasagna", "Curry Leaf Pesto Pasta", "Pasta Arrabbiata", 
      "White Sauce Pasta", "Chicken Pasta", "Spaghetti Carbonara", "Lasagna Bolognese", 
      "Ravioli Spinaci e Ricotta", "Pasta Arrabiata", "Veg White Sauce Pasta", 
      "Chicken Alfredo Pasta", "Chicken Alfredo", "Penne Puttanesca", "Penne Arrabbiata", 
      "Italian Veggie Sizzler", "Red Sauce Pasta", "Lobster Ravioli", "Zoi Special Pasta", 
      "Thai Basil Pasta", "Truffle Mushroom Pasta", "Pasta Carbonara", "Pasta Station", 
      "Penne Arrabiata", "Lasagna"
    ],
    "Shawarma": [
      "Chicken Shawarma", "Mutton Shawarma", "Shawarma"
    ],
    "Noodles": [
      "Pad Thai", "Chicken Ramen", "Chicken Hakka Noodles", "Veg Hakka Noodles", 
      "Singapore Rice Noodles", "Hakka Noodles", "Veg Manchurian Sizzler", "Japanese Ramen", 
      "Vietnamese Pho", "Pad Thai Noodles", "Singapore Noodles", "Schezwan Noodles", 
      "Dan Dan Noodles", "Chinese Stir Fry", "Manchow Soup", "Ghatiya"
    ],
    "Khichdi": [
      "Khichdi", "Vaghareli Khichdi", "Gujarati Khichdi", "Masala Khichdi", 
      "Kathiyawadi Khichdi", "Village Style Khichdi", "Royal Khichdi"
    ],
    "Kachori": [
      "Kachori"
    ],
    "Juice": [
      "Fresh Orange Juice", "Fresh Lime Water", "Fresh Juice", "Sugarcane Juice", 
      "Garden Fresh Lime Water", "Fresh Limeade", "Soft Drinks", "Orange Juice"
    ],
    "Dhokla": [
      "Dhokla", "Kathiyawadi Dhokla", "Fresh Dhokla", "Gujarati Pizza", "Spicy Dhokla", "Dhokla Sandwich"
    ],
    "Waffle": [
      "Waffle", "Belgian Waffle", "Chocolate Waffle", "Honey Waffle"
    ]
  };


  // Food dishes array with clean image URLs
  const foodDishes = [
    { name: 'Pizza', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866246/Pizza_wevg85.png' }, 
    { name: 'Pav Bhaji', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866046/Pav_Bhaji_xzjrwp.png' }, 
    { name: 'Sev Usal', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866138/Sev_Usal_ryny84.png' }, 
    { name: 'Rolls', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866344/Rolls_qzv1yt.png' }, 
    { name: 'Vada Pav', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757864883/Vada_Pav_eplbzh.png' }, 
    { name: 'Samosa', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866447/Samosa_ncxbnb.png' }, 
    { name: 'Burger', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866535/Burger_aekoln.png' }, 
    { name: 'Biryani', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757864870/Biryani_gjzmcy.png' }, 
    { name: 'Cakes', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757864871/Cakes_mzc5im.png' }, 
    { name: 'Chinese', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757864872/Chinese_q9gw2d.png' }, 
    { name: 'Dosa', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757864874/Dosa_mnqaht.png' }, 
    { name: 'Shakes', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757867272/Shakes_xlbfnr.png' }, 
    { name: 'Pasta', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866613/Pasta_fechei.png' }, 
    { name: 'Shawarma', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757865914/Shawarma_hn0jvh.png' }, 
    { name: 'Noodles', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866682/Noodles_efkxmj.png' }, 
    { name: 'Khichdi', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866766/Khichdi_fkqy4t.png' }, 
    { name: 'Kachori', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866840/Kachori_updlni.png' }, 
    { name: 'Juice', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757867396/Juice_leznuh.png' }, 
    { name: 'Dhokla', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757866910/Dhokla_bfs2cl.png' }, 
    { name: 'Waffle', image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1757865807/Waffle_wu2trr.png' } 
  ];


  // Load restaurants from API
  useEffect(() => {
    loadRestaurants();
  }, [selectedDish, currentPage]);


  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 12
      };

      if (selectedDish !== 'All') {
        const keywords = dishKeywords[selectedDish] || [selectedDish];
        params.search = keywords[0];
      }

      const response = await restaurantService.getRestaurants(params);
      
      if (response.success) {
        setRestaurants(response.data);
        setTotalPages(response.totalPages);
      } else {
        setError('Failed to load restaurants');
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      setError('Failed to load restaurants. Please check your backend server.');
    } finally {
      setLoading(false);
    }
  };


  const searchRestaurantsByCategory = async (dishName) => {
    try {
      setLoading(true);
      setError('');

      const keywords = dishKeywords[dishName] || [dishName];
      let allResults = new Set();

      for (const keyword of keywords.slice(0, 10)) {
        try {
          const response = await restaurantService.searchRestaurants(keyword);
          if (response.success && response.data.length > 0) {
            response.data.forEach(restaurant => {
              if (!Array.from(allResults).find(r => r._id === restaurant._id)) {
                allResults.add(restaurant);
              }
            });
          }
        } catch (err) {
          console.warn(`Search failed for keyword: ${keyword}`, err);
        }

        if (allResults.size >= 12) break;
      }

      let searchResults = Array.from(allResults);

      if (searchResults.length === 0) {
        const response = await restaurantService.searchRestaurants(dishName.toLowerCase());
        if (response.success) {
          searchResults = response.data;
        }
      }

      setRestaurants(searchResults);
      setCurrentPage(1);
      setTotalPages(Math.ceil(searchResults.length / 12));
      
    } catch (error) {
      console.error('Category search failed:', error);
      setError(`No restaurants found serving ${dishName}`);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await restaurantService.searchRestaurants(searchQuery);
      if (response.success) {
        setRestaurants(response.data);
        setSelectedDish('All');
      }
    } catch (error) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };


  const handleDishChange = (dishName) => {
    setSelectedDish(dishName);
    setCurrentPage(1);
    
    if (dishName === 'All') {
      loadRestaurants();
    } else {
      searchRestaurantsByCategory(dishName);
    }
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  if (loading && restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-spin" />
          <p className="text-gray-600">Loading delicious restaurants...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection />
      </div>


      <main>
        {/* Error Message */}
        {error && (
          <div className="container px-4 py-4 mx-auto">
            <div className="px-4 py-3 mb-6 text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
              <button 
                onClick={loadRestaurants}
                className="ml-4 text-red-600 underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}


        {/* Stats Section */}
        <div className="container px-4 py-8 mx-auto">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { number: `100+`, label: 'Restaurants', icon: '🏪' },
              { number: '1K+', label: 'Happy Customers', icon: '😊' },
              { number: '25min', label: 'Fast Delivery', icon: '🚗' },
              { number: '2400+', label: 'Food Items', icon: '🍽️' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 text-center transition-shadow bg-white shadow-sm rounded-2xl hover:shadow-md"
              >
                <div className="mb-2 text-4xl">{stat.icon}</div>
                <div className="mb-1 text-2xl font-bold text-gray-800">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>


        {/* Food Categories Section */}
        <div className="container px-4 py-8 mx-auto">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex pb-6 space-x-4" style={{ width: 'max-content' }}>
              
              {/* All Option */}
              <div
                className="flex-shrink-0 text-center cursor-pointer"
                onClick={() => handleDishChange('All')}
              >
                <img
                  src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1757903263/All_mehgwt.png"
                  alt="All"
                  className="object-cover w-48 h-40 mx-auto"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128x128/f59e0b/white?text=All';
                  }}
                />
                <p className={`text-sm font-medium mt-3 ${selectedDish === 'All' ? 'text-orange-500' : 'text-gray-700'}`}>
                  All
                </p>
              </div>


              {/* Food Dishes */}
              {foodDishes.map((dish, index) => (
                <motion.div
                  key={dish.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex-shrink-0 text-center cursor-pointer"
                  onClick={() => handleDishChange(dish.name)}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="object-cover w-48 h-40 mx-auto"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/128x128/f59e0b/white?text=${dish.name.charAt(0)}`;
                    }}
                  />
                  <p className={`text-sm font-medium mt-3 max-w-[8rem] mx-auto leading-tight ${selectedDish === dish.name ? 'text-orange-500' : 'text-gray-700'}`}>
                    {dish.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>


        {/* Restaurants Grid - Fixed Height Cards */}
        <div className="container px-4 py-8 mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="overflow-hidden bg-white shadow-md rounded-3xl animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                      <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                {selectedDish === 'All' ? 'No restaurants found' : `No restaurants found serving ${selectedDish}`}
              </h3>
              <p className="text-gray-500">Try selecting a different dish or search option.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restaurants.map((restaurant, index) => (
                <RestaurantCard restaurant={restaurant} index={index} key={restaurant._id} />
              ))}
            </div>
          )}


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-white rounded-xl border-2 border-gray-200 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 hover:text-orange-600 transition-all duration-200"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 bg-white rounded-xl border-2 border-gray-200 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 hover:text-orange-600 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Call to Action */}
        <div className="py-16 text-white bg-gradient-to-r from-orange-500 to-red-500">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Order?</h2>
            <p className="mb-8 text-xl opacity-90">
              Choose from 100+ restaurants in your area
            </p>
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-8 py-3 font-semibold text-orange-600 transition-all duration-200 bg-white rounded-full shadow-lg hover:bg-gray-100 hover:scale-105"
            >
              Browse All Restaurants
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>


      <Footer />
    </div>
  );
};


export default Home;
