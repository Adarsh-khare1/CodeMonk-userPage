import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/database.js';
import { setupMiddleware } from './middleware/app.middleware.js';
import { setupRoutes } from './config/routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting server initialization...');



// Setup middleware with error handling
try {
  setupMiddleware(app);
  console.log('✅ Middleware setup completed');
} catch (error) {
  console.error('❌ Error setting up middleware:', error);

  process.exit(1);
}

// Setup routes with error handling
try {
  setupRoutes(app);
  console.log('✅ Routes setup completed');
} catch (error) {
  console.error('❌ Error setting up routes:', error);
  process.exit(1);
}


// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  console.warn('⚠️ 404 Not Found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  res.status(404).json({ error: 'Not Found', message: 'Route not found' });
});

// Connect to database and start server
connectDB()
  .then(() => {
    console.log('✅ Database connection established');

    const server = app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
