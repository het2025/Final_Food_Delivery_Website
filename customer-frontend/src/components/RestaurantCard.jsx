import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, TrendingUp } from 'lucide-react';

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95 
  },
  visible: (i) => ({ 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

const RestaurantCard = ({ restaurant, index }) => (
    <motion.div
        custom={index}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
        }}
    >
        <Link
        to={`/menu/${restaurant._id}`}
        className="flex flex-col h-full overflow-hidden transition-shadow duration-300 bg-white shadow-md rounded-3xl hover:shadow-2xl group"
        >
        {/* Image Container */}
        <div className="relative flex-shrink-0 h-48 overflow-hidden">
            <motion.img
            src={restaurant.image || '/placeholder-restaurant.jpg'}
            alt={restaurant.name}
            className="object-cover w-full h-full"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onError={(e) => {
                e.target.src = '/placeholder-restaurant.jpg';
            }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t via-transparent to-transparent from-black/40 group-hover:opacity-100"></div>
            
            {/* Promoted Badge - Only this stays on image */}
            {restaurant.features?.includes('Promoted') && (
            <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                <TrendingUp className="w-3 h-3" />
                Promoted
            </div>
            )}
        </div>

        {/* Content Container - Fixed Height */}
        <div className="flex flex-col flex-1 p-5">
            {/* Restaurant Name & Rating Row */}
            <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="flex-1 text-lg font-bold text-gray-900 transition-colors duration-200 line-clamp-1 group-hover:text-orange-600">
                {restaurant.name}
            </h3>
            {/* Rating Badge - Moved here */}
            <div className="flex items-center flex-shrink-0 gap-1 px-2 py-1 bg-white border-2 border-yellow-400 rounded-lg shadow-sm">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                <span className="text-sm font-bold text-gray-800">{restaurant.rating}</span>
            </div>
            </div>

            {/* Cuisine Tags - Fixed to 2 items + counter */}
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
            {restaurant.cuisine.slice(0, 2).map((cuisine, idx) => (
                <span 
                key={idx}
                className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full whitespace-nowrap"
                >
                {cuisine}
                </span>
            ))}
            {restaurant.cuisine.length > 2 && (
                <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-full whitespace-nowrap">
                +{restaurant.cuisine.length - 2} more
                </span>
            )}
            </div>

            {/* Info Grid - Pushed to bottom */}
            <div className="pt-3 mt-auto space-y-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="flex-shrink-0 w-4 h-4 text-orange-500" />
                <span className="font-medium">{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                <span className="text-xs whitespace-nowrap">({restaurant.totalReviews} reviews)</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-600 max-w-[60%]">
                <MapPin className="flex-shrink-0 w-4 h-4 text-orange-500" />
                <span className="truncate">{restaurant.location.area}</span>
                </div>
                <span className="px-2 py-1 text-xs font-bold text-orange-600 rounded-lg whitespace-nowrap bg-orange-50">
                {restaurant.priceRange}
                </span>
            </div>
            </div>
        </div>
        </Link>
    </motion.div>
);

export default RestaurantCard;