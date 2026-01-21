import authRoutes from '../routes/auth.routes.js';
import problemRoutes from '../routes/problem.routes.js';
import submissionRoutes from '../routes/submission.routes.js';
import commentRoutes from '../routes/comment.routes.js';
import userRoutes from '../routes/user.routes.js';
import chatbotRoutes from '../routes/chatbot.routes.js';

export const setupRoutes = (app) => {
  try {
    // Mount routes with error handling
    app.use('/api/auth', (req, res, next) => {
      console.log('🔐 Auth route accessed:', req.method, req.url);
      next();
    }, authRoutes);

    app.use('/api/problems', (req, res, next) => {
      console.log('📚 Problems route accessed:', req.method, req.url);
      next();
    }, problemRoutes);

    app.use('/api/submissions', (req, res, next) => {
      console.log('📤 Submissions route accessed:', req.method, req.url);
      next();
    }, submissionRoutes);

    app.use('/api/comments', (req, res, next) => {
      console.log('💬 Comments route accessed:', req.method, req.url);
      next();
    }, commentRoutes);

    app.use('/api/users', (req, res, next) => {
      console.log('👤 Users route accessed:', req.method, req.url);
      next();
    }, userRoutes);

    app.use('/api/chatbot', (req, res, next) => {
      console.log('🤖 Chatbot route accessed:', req.method, req.url);
      next();
    }, chatbotRoutes);

    // Add simple chat endpoint for compatibility with your existing frontend
    app.use('/chat', (req, res, next) => {
      console.log('💬 Simple chat route accessed:', req.method, req.url);
      next();
    }, chatbotRoutes);

    // Health check with detailed logging
    app.get('/api/health', (req, res) => {
      console.log('🏥 Health check requested');
      res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    console.log('✅ All routes mounted successfully');

  } catch (error) {
    console.error('❌ Error setting up routes:', error);
    throw error;
  }
};