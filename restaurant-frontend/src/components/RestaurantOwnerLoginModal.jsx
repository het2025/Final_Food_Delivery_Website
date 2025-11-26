import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { loginRestaurantOwner } from '../api/restaurantOwnerApi';

// Sanitize input - helps reduce basic XSS/injection tricks
const safeValue = s => (typeof s === "string" ? s.replace(/[<>\"'`]/g, "") : "");

// Improved password test:
// At least 8 chars, upper, lower, number, symbol
const isStrongPassword = pass =>
  /[A-Z]/.test(pass) &&
  /[a-z]/.test(pass) &&
  /[0-9]/.test(pass) &&
  /[@$!%*?&]/.test(pass) &&
  pass.length >= 8;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RestaurantOwnerLoginModal({
  isOpen,
  onClose,
  onRegisterClick,
  onLoginSuccess
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Simple rate limit: block more than 1 attempt every 2s
  const lastSubmitRef = useRef(Date.now());
  const [throttle, setThrottle] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Rate limiting
    const now = Date.now();
    if (throttle || now - lastSubmitRef.current < 2000) {
      setError('Please wait before trying again.');
      return;
    }
    lastSubmitRef.current = now;
    setThrottle(true);
    setTimeout(() => setThrottle(false), 2500);

    // Input validation (client-side)
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError("Password must be at least 8 chars, upper, lower, number, symbol.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Backend API call (ensure backend also validates & hashes)
      const res = await loginRestaurantOwner({
        email: safeValue(email.trim().toLowerCase()),
        password: password
      });
      if (!res.success) {
        throw new Error("Invalid login credentials.");
      }
      if (onLoginSuccess) {
        onLoginSuccess(res.data);
      }
      onClose();
      navigate('/dashboard');
    } catch (err) {
      // Check for specific approval/deactivation messages
      if (err.message && (err.message.includes('approval') || err.message.includes('deactivated'))) {
        setError(err.message);
      } else {
        setError("Invalid login credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative p-8 w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition hover:text-gray-600"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Restaurant Owner Login 🍴
        </h2>

        {error && (
          <div className="px-4 py-2 mb-4 text-sm text-center text-red-700 bg-red-50 rounded-lg">
              {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
          <motion.input
            type="email"
            placeholder="Enter Email"
            required
            value={email}
            onChange={e => setEmail(safeValue(e.target.value))}
            disabled={loading}
            autoComplete="username"
            spellCheck={false}
            className="px-4 py-3 w-full placeholder-gray-400 text-gray-700 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
            whileFocus={{ scale: 1.01 }}
            maxLength={64}
          />
          <motion.input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="px-4 py-3 w-full placeholder-gray-400 text-gray-700 rounded-lg border border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
            whileFocus={{ scale: 1.01 }}
            minLength={8}
            maxLength={32}
          />
          <motion.button
            type="submit"
            disabled={loading || throttle}
            className="py-3 w-full font-semibold text-white bg-orange-500 rounded-lg shadow-md transition hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={!loading ? { scale: 1.03 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500">
          Not registered as a restaurant owner?{' '}
          <button
            className="text-orange-500 underline transition hover:text-orange-600"
            onClick={() => {
              if (loading) return;
              onClose();
              onRegisterClick();
            }}
          >
            Register
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default RestaurantOwnerLoginModal;