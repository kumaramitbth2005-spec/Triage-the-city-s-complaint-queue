const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable public DNS servers for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to system DNS
}

const DEFAULT_ATLAS_URI = 'mongodb+srv://AmitSharma:Amitbth%408969%23AMAA%23123@cluster0.zrrzley.mongodb.net/city_complaint_triage?retryWrites=true&w=majority';

const connectDB = async (retries = 5, delay = 3000) => {
  const uri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 Connecting to MongoDB (Attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
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


