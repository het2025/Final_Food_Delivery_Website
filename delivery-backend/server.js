import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database.js';
import { setupOrderSocket } from './socket/orderSocket.js';
import axios from 'axios';
import { DeliveryOrder } from './models/DeliveryOrder.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5176', // Delivery frontend
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
  }
});

// Setup socket handlers
setupOrderSocket(io);

// Make io accessible in routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5176', // Delivery frontend
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delivery backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/delivery/auth', authRoutes);
app.use('/api/delivery/orders', orderRoutes);
app.use('/api/delivery/profile', profileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5003;
httpServer.listen(PORT, () => {
  console.log(`🚀 Delivery Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ Socket.IO enabled`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Polling Service: Fetch Ready orders from Customer Backend
const pollReadyOrders = async () => {
  try {
    const CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'http://localhost:5000';
    
    // Fetch orders with status 'Ready'
    const response = await axios.get(`${CUSTOMER_BACKEND_URL}/api/orders/internal/ready`);
    
    if (response.data.success && response.data.data.length > 0) {
      const readyOrders = response.data.data;
      
      for (const order of readyOrders) {
        // Check if we already have this order
        const exists = await DeliveryOrder.findOne({ orderId: order._id });
        
        if (!exists) {
          console.log(`📥 Polling found new ready order: ${order.orderNumber}`);
          
          // Create Delivery Order
          const deliveryOrder = new DeliveryOrder({
            orderId: order._id,
            orderNumber: order.orderNumber,
            restaurant: order.restaurant._id,
            restaurantName: order.restaurant.name,
            restaurantLocation: order.restaurant.location,
            customer: order.customer._id,
            customerName: order.customer.name || 'Customer',
            customerPhone: order.customer.phone || '',
            deliveryAddress: order.deliveryAddress, // Ensure this is object in customer-backend response
            orderAmount: order.total,
            deliveryFee: order.deliveryFee || 0,
            distance: order.deliveryDistance || 0,
            estimatedDeliveryTime: 30,
            status: 'ready_for_pickup'
          });

          await deliveryOrder.save();
          console.log(`✅ Created delivery order from polling: ${deliveryOrder._id}`);
          
          // Notify delivery boys via Socket
          if (io) {
             io.emit('new:order', {
                orderId: deliveryOrder._id,
                orderNumber: deliveryOrder.orderNumber,
                restaurantName: deliveryOrder.restaurantName,
                deliveryAddress: deliveryOrder.deliveryAddress,
                orderAmount: deliveryOrder.orderAmount,
                deliveryFee: deliveryOrder.deliveryFee,
                distance: deliveryOrder.distance
             });
          }
        }
      }
    }
  } catch (error) {
    // Silent fail for polling errors to avoid log spam, unless critical
    if (error.code !== 'ECONNREFUSED') {
        console.error('Polling error:', error.message);
    }
  }
};

// Start polling every 10 seconds
setInterval(pollReadyOrders, 10000);
console.log('🔄 Order Polling Service started (10s interval)');

export { io };
