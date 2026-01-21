import express from 'express';
import cors from 'cors';

export const setupMiddleware = (app) => {
  try {
    // CORS middleware - Allow both React app and Live Server
    const allowedOrigins = [
      'http://localhost:3000',  // React development server
      'http://127.0.0.1:5500',  // Live Server
      'http://localhost:5500',  // Alternative Live Server
      process.env.CLIENT_URL
    ].filter(Boolean);

    app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          console.warn('⚠️ CORS blocked request from origin:', origin);
          return callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));
    console.log('✅ CORS middleware configured for origins:', allowedOrigins);

    // Body parsing middleware with error handling
    app.use(express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf);
        } catch (e) {
          console.error('❌ Invalid JSON received:', {
            url: req.url,
            method: req.method,
            body: buf.toString(),
            error: e.message
          });
          res.status(400).json({ error: 'Invalid JSON' });
          return;
        }
      }
    }));
    console.log('✅ JSON parsing middleware configured');

    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    console.log('✅ URL-encoded parsing middleware configured');

    // Request logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      console.log('📨 Incoming request:', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log('📤 Response sent:', {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        });
      });

      next();
    });

    // Security headers
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

  } catch (error) {
    console.error('❌ Error in middleware setup:', error);
    throw error;
  }
};