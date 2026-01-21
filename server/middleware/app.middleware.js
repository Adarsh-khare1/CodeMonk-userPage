import express from 'express';
import cors from 'cors';

export const setupMiddleware = (app) => {
  try {
    // CORS middleware
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }));
    console.log('✅ CORS middleware configured');

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