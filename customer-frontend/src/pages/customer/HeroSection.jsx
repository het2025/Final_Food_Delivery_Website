// import { motion } from 'framer-motion'
// import { ChevronRight, MapPin, Clock, Star } from 'lucide-react'
// import { Link } from 'react-router-dom'

// const HeroSection = () => {
//   const stats = [
//     { number: '10K+', label: 'Happy Customers' },
//     { number: '500+', label: 'Restaurant Partners' },
//     { number: '25 min', label: 'Average Delivery' },
//     { number: '4.8★', label: 'App Rating' }
//   ]

//   return (
//     <div className="relative overflow-hidden">
//       {/* Background with gradient */}
//       <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-20 px-6 rounded-3xl shadow-2xl mb-16 max-w-7xl mx-auto relative">
        
//         {/* Background decorations */}
//         <div className="absolute top-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full -mr-48 -mt-48"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -ml-32 -mb-32"></div>
        
//         <div className="relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-4xl mx-auto text-center"
//           >
//             {/* Main heading */}
//             <motion.h1 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
//             >
//               Delicious Food
//               <br />
//               <span className="text-yellow-300">Delivered Fast</span>
//             </motion.h1>
            
//             {/* Subtitle */}
//             <motion.p 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-orange-100"
//             >
//               Explore your favorite cuisines and nearby restaurants. Order easy, enjoy fast delivery to your doorstep.
//             </motion.p>
            
//             {/* Location input */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               className="max-w-md mx-auto mb-8"
//             >
//               <div className="flex items-center bg-white rounded-full p-2 shadow-lg">
//                 <MapPin className="w-5 h-5 text-gray-400 ml-4" />
//                 <input
//                   type="text"
//                   placeholder="Enter your delivery location"
//                   className="flex-1 px-4 py-2 text-gray-700 bg-transparent focus:outline-none"
//                 />
//                 <button className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors">
//                   Find Food
//                 </button>
//               </div>
//             </motion.div>
            
//             {/* CTA Buttons */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.8 }}
//               className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
//             >
//               <Link
//                 to="/restaurants"
//                 className="inline-flex items-center justify-center gap-3 bg-white text-orange-500 rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
//               >
//                 Browse Restaurants <ChevronRight className="w-5 h-5" />
//               </Link>
              
//               <button className="inline-flex items-center justify-center gap-3 border-2 border-white text-white rounded-full px-8 py-4 font-bold text-lg hover:bg-white hover:text-orange-500 transition-all duration-300">
//                 <Clock className="w-5 h-5" />
//                 Order Now
//               </button>
//             </motion.div>
//           </motion.div>

//           {/* Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 1 }}
//             className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
//           >
//             {stats.map((stat, index) => (
//               <motion.div
//                 key={stat.label}
//                 initial={{ opacity: 0, scale: 0.5 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 1.2 + index * 0.1 }}
//                 className="text-center"
//               >
//                 <div className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">
//                   {stat.number}
//                 </div>
//                 <div className="text-orange-100 text-sm md:text-base">
//                   {stat.label}
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
        
//         {/* Floating food icons */}
//         <div className="absolute top-20 left-10 animate-bounce">
//           <div className="text-4xl opacity-20">🍕</div>
//         </div>
//         <div className="absolute top-32 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
//           <div className="text-4xl opacity-20">🍔</div>
//         </div>
//         <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
//           <div className="text-4xl opacity-20">🍜</div>
//         </div>
//         <div className="absolute bottom-32 right-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
//           <div className="text-4xl opacity-20">🍰</div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default HeroSection
