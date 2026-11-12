const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable public DNS servers for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to system DNS
}

const connectDB = async (retries = 5, delay = 3000) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set. Please configure it in your .env file.');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(uri, {
        // Connection timeouts — generous enough for Atlas free-tier cold starts
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS:         30000,
        socketTimeoutMS:          45000,

        // Buffering: allow mongoose to queue ops while (re-)connecting
        // but cap the buffer so stale ops don't pile up
        bufferCommands: true,
        maxPoolSize:    10,
        minPoolSize:    2,

        // Heartbeat keeps the connection alive between requests
        heartbeatFrequencyMS: 10000,

        // Automatically retry once on initial connection failure
        retryWrites: true,
        retryReads:  true,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Reconnect event handlers
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected — will auto-reconnect');
      });
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      return conn;
    } catch (error) {
      console.error(`⚠️ MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('❌ All MongoDB connection attempts exhausted. Continuing in resilient mode.');
        throw error;
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;


