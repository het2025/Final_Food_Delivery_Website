import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, Loader } from 'lucide-react';
import { restaurantService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewList from '../../components/ReviewList';
import ReviewForm from '../../components/ReviewForm';

const Menu = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodFilter, setFoodFilter] = useState('all'); // 'all', 'veg', 'non-veg'
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadRestaurantDetails();
  }, [vendorId]);

  const loadRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await restaurantService.getRestaurantById(vendorId);

      if (response.success) {
        setRestaurant(response.data);
        setMenu(response.data.menu || []);
      } else {
        setError('Restaurant not found');
      }
    } catch (error) {
      setError('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMenu = () => {
    let filteredMenu = menu;

    // Only filter by category if not 'All'
    if (selectedCategory !== 'All') {
      filteredMenu = menu.filter(category => category.category === selectedCategory);
    }

    // Apply food type filter
    if (foodFilter === 'veg') {
      filteredMenu = filteredMenu.map(category => ({
        ...category,
        items: category.items.filter(item => item.isVeg)
      })).filter(category => category.items.length > 0);
    } else if (foodFilter === 'non-veg') {
      filteredMenu = filteredMenu.map(category => ({
        ...category,
        items: category.items.filter(item => !item.isVeg)
      })).filter(category => category.items.length > 0);
    }

    return filteredMenu;
  };

  const handleAddToCart = (item, categoryName) => {
    const cartItem = {
      _id: `${restaurant._id}-${item.name}`,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      name: item.name,
      price: item.price,
      image: item.url || restaurant.image,
      category: categoryName,
      isVeg: item.isVeg,
      description: item.description
    };
    addToCart(cartItem);
  };

  const getItemQuantity = (item) => {
    const cartItem = cartItems.find(cartItem =>
      cartItem.name === item.name && cartItem.restaurantId === restaurant._id
    );
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Restaurant Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The restaurant you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const categories = ['All', ...menu.map(category => category.category)];
  const filteredMenu = getFilteredMenu();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-16 container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Restaurant Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={restaurant.image || '/placeholder-restaurant.jpg'}
              alt={restaurant.name}
              className="w-full md:w-48 h-48 object-cover rounded-xl"
              onError={(e) => {
                e.target.src = '/placeholder-restaurant.jpg';
              }}
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{restaurant.name}</h1>
              <p className="text-gray-600 mb-4">{restaurant.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span>({restaurant.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.location.area}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine.map((cuisine, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'menu'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Menu
            {activeTab === 'menu' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'reviews'
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Reviews
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full" />
            )}
          </button>
        </div>

        {activeTab === 'reviews' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            </div>

            {showReviewForm && (
              <ReviewForm
                restaurantId={restaurant.restaurantId}
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  // Trigger refresh of reviews list (you might need to lift state or use a ref/context)
                  // For now, we'll just close the form. Ideally ReviewList should refetch.
                  // A simple way is to remount ReviewList by changing a key, or passing a refresh trigger.
                  // Let's use a key approach in the render below.
                  window.location.reload(); // Simple refresh for now
                }}
              />
            )}

            <ReviewList restaurantId={restaurant.restaurantId} />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Food Type Filter */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setFoodFilter('veg')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${foodFilter === 'veg'
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <img
                  src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1758009402/veg_g9mrsg.png"
                  alt="Veg"
                  className="w-8 h-10"
                />
                Veg Food
              </button>

              <button
                onClick={() => setFoodFilter('non-veg')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${foodFilter === 'non-veg'
                    ? 'bg-red-100 border-2 border-red-500 text-red-700'
                    : 'bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <img
                  src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1758009402/non-veg_ucnnbj.png"
                  alt="Non-Veg"
                  className="w-8 h-10"
                />
                Non-Veg Food
              </button>

              {(foodFilter === 'veg' || foodFilter === 'non-veg') && (
                <button
                  onClick={() => setFoodFilter('all')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Menu Items */}
            {filteredMenu.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No items found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredMenu.map((category) => (
                  <div key={category.category}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                      {category.category}
                    </h2>
                    <div className="space-y-4">
                      {category.items.map((item) => (
                        <div key={item.name} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                {/* Updated Veg/Non-Veg Image */}
                                <img
                                  src={
                                    item.isVeg
                                      ? "https://res.cloudinary.com/dovlhkyrr/image/upload/v1758012359/veg_food_q3f5f0.png"
                                      : "https://res.cloudinary.com/dovlhkyrr/image/upload/v1758012359/non-veg_food_czrcmx.png"
                                  }
                                  alt={item.isVeg ? "Veg" : "Non-Veg"}
                                  className="w-4 h-4 mt-1"
                                />

                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    {item.name}
                                    {item.isPopular && (
                                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                        Popular
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                                  <p className="text-xl font-bold text-orange-600">₹{item.price}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 mt-4">
                                {getItemQuantity(item) > 0 ? (
                                  <div className="flex items-center gap-3 bg-orange-500 text-white rounded-lg px-3 py-2">
                                    <button className="hover:bg-orange-600 rounded p-1">
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-semibold">{getItemQuantity(item)}</span>
                                    <button
                                      onClick={() => handleAddToCart(item, category.category)}
                                      className="hover:bg-orange-600 rounded p-1"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleAddToCart(item, category.category)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add to Cart
                                  </button>
                                )}
                              </div>
                            </div>

                            {item.url && (
                              <div className="md:w-32 md:h-32">
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Menu;
