// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
// import { authService } from '../../services/api';
// import { useUser } from '../../context/UserContext';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const navigate = useNavigate();
//   const { setUser } = useUser();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     // Clear error when user starts typing
//     if (error) setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await authService.login(formData);
      
//       if (response.success) {
//         setUser(response.data.user);
//         navigate('/');
//       } else {
//         setError(response.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setError(error.message || 'Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl"
//       >
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <h1 className="mb-2 text-3xl font-bold text-gray-800">Welcome Back!</h1>
//           <p className="text-gray-600">Sign in to your QuickBites account</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="px-4 py-3 mb-6 text-red-600 border border-red-200 rounded-lg bg-red-50">
//             {error}
//           </div>
//         )}

//         {/* Login Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your email"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full py-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <>
//                 <Loader className="w-5 h-5 animate-spin" />
//                 Signing In...
//               </>
//             ) : (
//               'Sign In'
//             )}
//           </button>
//         </form>

//         {/* Footer */}
//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Don't have an account?{' '}
//             <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-700">
//               Sign Up
//             </Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;
