require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now (configure properly in production)
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`👤 Client ${socket.id} joined room: order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import route files
const locationRoutes = require('./routes/locationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Import all models
require('./models');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Customer frontend
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'QuickBites API is running successfully! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      users: '/api/users',
      orders: '/api/orders',
      addresses: '/api/addresses',
      location: '/api/location',
      location: '/api/location',
      geocode: '/api/geocode',
      reviews: '/api/reviews'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/users', require('./routes/users'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/orders', orderRoutes); // ✅ Single orders route
app.use('/api/location', locationRoutes);
app.use('/api/geocode', geocodeRoutes); // ✅ OpenStreetMap geocoding
app.use('/api/reviews', reviewRoutes); // ✅ Restaurant reviews

// Debug log for geocode routes
console.log('📍 Geocode routes registered at /api/geocode');

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// 404 handler (must be last)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/auth',
      '/api/restaurants',
      '/api/users',
      '/api/orders',
      '/api/addresses',
      '/api/location',
      '/api/location',
      '/api/geocode',
      '/api/reviews'
    ]
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`🗺️  Geocode endpoint: http://localhost:${PORT}/api/geocode`);
  console.log('\n✅ Available routes:');
  console.log('   - GET  /api/geocode/reverse?lat=22.3&lng=73.1');
  console.log('   - GET  /api/geocode/search?query=Alkapuri');
  console.log('\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
