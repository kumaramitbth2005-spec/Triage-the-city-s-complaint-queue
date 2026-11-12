const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable public DNS servers for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to system DNS
}

// CRITICAL: Disable command buffering so queries NEVER hang for 10,000ms
// when database is disconnected or cold-starting.
mongoose.set('bufferCommands', false);

let isConnecting = false;
let reconnectInterval = null;

const connectDB = async (retries = 2, delay = 2000) => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set. Running in resilient offline mode.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) return null;
  isConnecting = true;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 15000,
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 2,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      isConnecting = false;

      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected — auto-reconnect scheduled');
        scheduleBackgroundReconnect();
      });

      return conn;
    } catch (error) {
      console.warn(`⚠️ MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  isConnecting = false;
  console.warn('⚠️ MongoDB Atlas is not yet reachable. Backend is active in resilient fallback mode (Zero downtime).');
  scheduleBackgroundReconnect();
  return null;
};

function scheduleBackgroundReconnect() {
  if (reconnectInterval) return;
  reconnectInterval = setInterval(async () => {
    if (mongoose.connection.readyState === 1 || isConnecting) return;
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) return;
      console.log('🔄 Background MongoDB Atlas reconnect attempt...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        bufferCommands: false
      });
      console.log('✅ Background MongoDB Atlas reconnection successful!');
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    } catch (err) {
      // Quiet background failure, keeps retrying
    }
  }, 20000);
}

module.exports = connectDB;
