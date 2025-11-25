import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js'; 
import menuRoutes from './routes/menuRoutes.js';  // ✅ ADD THIS
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',   
    'http://localhost:5173',   
    'http://localhost:5174',
    'http://localhost:3174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Restaurant Owner backend is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5001
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Restaurant Owner backend API – Use /api/health for status' });
});

// ✅ MOUNT ALL ROUTES
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted at /api/auth');

app.use('/api/profile', profileRoutes);
console.log('✅ Profile routes mounted at /api/profile');

app.use('/api/menu', menuRoutes);  // ✅ ADD THIS LINE
console.log('✅ Menu routes mounted at /api/menu');

app.use('/api/orders', orderRoutes);
console.log('✅ Order routes mounted at /api/orders');

app.use('/api/dashboard', dashboardRoutes);
console.log('✅ Dashboard routes mounted at /api/dashboard');

// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err.message })
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Restaurant Owner backend listening on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
    });

    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => console.log('Process terminated'));
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    console.error('💥 Check .env for MONGO_URI or network issues');
    process.exit(1);
  }
};

startServer();
