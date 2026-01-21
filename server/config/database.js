import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');

    // If no MongoDB URI configured, skip connecting in non-production environments
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.startsWith('REPLACE')) {
      console.warn('⚠️ No valid MONGODB_URI provided. Skipping DB connection (development mode).');
      return Promise.resolve();
    }

    // Set mongoose options
    mongoose.set('strictQuery', true);

    // Connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('🛑 Closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', {
      error: error.message,
      code: error.code,
      codeName: error.codeName,
      timestamp: new Date().toISOString()
    });

    // Retry connection after delay
    console.log('⏳ Retrying connection in 5 seconds...');
    setTimeout(() => {
      connectDB();
    }, 5000);

    throw error;
  }
};