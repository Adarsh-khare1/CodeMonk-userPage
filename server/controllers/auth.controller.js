import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('📝 Signup attempt:', {
      email: req.body.email,
      username: req.body.username,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.warn('⚠️ Signup validation failed - missing fields:', {
        hasUsername: !!username,
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.warn('⚠️ Signup validation failed - invalid username format:', username);
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    if (username.length < 3 || username.length > 30) {
      console.warn('⚠️ Signup validation failed - username length:', username.length);
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }

    console.log('🔍 Checking for existing user...');
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.warn('⚠️ Signup failed - email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.warn('⚠️ Signup failed - username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    console.log('💾 Creating new user...');
    const user = new User({ username, email, password });
    await user.save();

    console.log('🔐 Generating JWT token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const duration = Date.now() - startTime;
    console.log('✅ Signup successful:', {
      userId: user._id,
      username: user.username,
      duration: `${duration}ms`
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Signup error:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      email: req.body.email,
      username: req.body.username,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.warn('⚠️ Duplicate key error:', { field, value: error.keyValue });
      return res.status(400).json({ message: `${field} already exists` });
    }

    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('🔑 Login attempt:', {
      email: req.body.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('⚠️ Login validation failed - missing fields:', {
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('🔍 Finding user...');
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.warn('⚠️ Login failed - user not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('⚠️ Login failed - invalid password for user:', user._id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔐 Generating JWT token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const duration = Date.now() - startTime;
    console.log('✅ Login successful:', {
      userId: user._id,
      username: user.username,
      duration: `${duration}ms`
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Login error:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
