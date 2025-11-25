import { motion } from 'framer-motion';
import { ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      {/* --- Color backdrop --- */}
      <div className="bg-gradient-to-br from-orange-500/90 via-red-500/90 to-pink-600/90 text-white py-20 px-6 shadow-2xl mb-16 w-full relative">
        {/* --- LEFT decorative poster --- */}
        <img
          src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1758114495/poster1_h2cjpw.png"
          alt="poster left"
          className="
            hidden lg:block            /* show only ≥ 1024 px */
            absolute left-0 top-0 h-full
            object-cover object-left
            pointer-events-none select-none
          "
        />

        {/* --- RIGHT decorative poster --- */}
        <img
          src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1758114496/poster2_ffswgl.png"
          alt="poster right"
          className="
            hidden lg:block
            absolute right-0 top-0 h-full
            object-cover object-right
            pointer-events-none select-none
          "
        />

        {/* --- Center content --- */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
          >
            Delicious Food
            <br />
            <span className="text-yellow-300">Delivered Fast</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-orange-100 max-w-2xl mx-auto"
          >
            Explore your favorite cuisines and nearby restaurants. Order easy,
            enjoy fast delivery to your doorstep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-3 bg-white text-orange-500 rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105"
            >
              Browse Restaurants
              <ChevronRight className="w-5 h-5" />
            </Link>

            <button className="inline-flex items-center gap-3 bg-white text-orange-500 rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105">
              <Clock className="w-5 h-5" />
              Order Now
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
