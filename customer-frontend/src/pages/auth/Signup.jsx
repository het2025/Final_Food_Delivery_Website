// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Mail, Lock, User, Phone, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
// import { authService } from '../../services/api';
// import { useUser } from '../../context/UserContext';

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const navigate = useNavigate();
//   const { loginUser } = useUser();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     if (error) setError('');
//     if (success) setSuccess('');
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       setError('Please enter your full name');
//       return false;
//     }
//     if (formData.name.trim().length < 2) {
//       setError('Name must be at least 2 characters long');
//       return false;
//     }
//     if (!formData.email.trim()) {
//       setError('Please enter your email address');
//       return false;
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email.trim())) {
//       setError('Please enter a valid email address');
//       return false;
//     }
//     if (!formData.password) {
//       setError('Please enter a password');
//       return false;
//     }
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       return false;
//     }
//     if (!formData.confirmPassword) {
//       setError('Please confirm your password');
//       return false;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }
//     if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
//       setError('Phone number must be exactly 10 digits');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const userData = {
//         name: formData.name.trim(),
//         email: formData.email.trim().toLowerCase(),
//         password: formData.password,
//         phone: formData.phone.trim()
//       };

//       console.log('Submitting signup with:', { ...userData, password: '***' });

//       const response = await authService.register(userData);
      
//       console.log('Signup response:', response);
      
//       if (response.success) {
//         setSuccess('Account created successfully! Redirecting...');
//         loginUser(response.data.user, response.data.token);
        
//         setTimeout(() => {
//           navigate('/');
//         }, 1500);
//       } else {
//         setError(response.message || 'Registration failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
      
//       // Handle specific error messages
//       if (error.message) {
//         if (error.message.includes('already exists') || 
//             error.message.includes('duplicate') ||
//             error.message.includes('login instead')) {
//           setError('An account with this email already exists. Please try logging in instead.');
//         } else if (error.message.includes('Network error') || 
//                    error.message.includes('ECONNREFUSED') ||
//                    error.message.includes('backend server')) {
//           setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
//         } else if (error.message.includes('validation') ||
//                    error.message.includes('required')) {
//           setError('Please fill in all required fields correctly.');
//         } else {
//           setError(error.message);
//         }
//       } else {
//         setError('Registration failed. Please check your information and try again.');
//       }
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
//           <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
//             <User className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="mb-2 text-3xl font-bold text-gray-800">Create Account</h1>
//           <p className="text-gray-600">Join QuickBites and discover amazing food</p>
//         </div>

//         {/* Success Message */}
//         {success && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="flex items-center gap-2 px-4 py-3 mb-6 text-green-600 border border-green-200 rounded-lg bg-green-50"
//           >
//             <CheckCircle className="w-5 h-5" />
//             {success}
//           </motion.div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="flex items-center gap-2 px-4 py-3 mb-6 text-red-600 border border-red-200 rounded-lg bg-red-50"
//           >
//             <AlertCircle className="w-5 h-5" />
//             {error}
//           </motion.div>
//         )}

//         {/* Signup Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Name Field */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Full Name *
//             </label>
//             <div className="relative">
//               <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your full name"
//               />
//             </div>
//           </div>

//           {/* Email Field */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Email Address *
//             </label>
//             <div className="relative">
//               <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your email"
//               />
//             </div>
//           </div>

//           {/* Phone Field */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Phone Number (Optional)
//             </label>
//             <div className="relative">
//               <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Enter your phone number"
//               />
//             </div>
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Password *
//             </label>
//             <div className="relative">
//               <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full py-3 pl-10 pr-12 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Create a strong password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
//               >
//                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//             </div>
//             <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
//           </div>

//           {/* Confirm Password Field */}
//           <div>
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Confirm Password *
//             </label>
//             <div className="relative">
//               <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//               <input
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//                 className="w-full py-3 pl-10 pr-12 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Confirm your password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
//               >
//                 {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <>
//                 <Loader className="w-5 h-5 animate-spin" />
//                 Creating Account...
//               </>
//             ) : (
//               'Create Account'
//             )}
//           </button>
//         </form>

//         {/* Footer */}
//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Already have an account?{' '}
//             <Link to="/login" className="font-medium text-orange-600 transition-colors hover:text-orange-700">
//               Sign In
//             </Link>
//           </p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Signup;
