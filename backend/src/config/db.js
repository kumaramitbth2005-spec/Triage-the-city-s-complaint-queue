const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable public DNS servers for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback to system DNS
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  const isCloudOrProd = process.env.RENDER || process.env.NODE_ENV === 'production';
  const connectionUri = uri || 'mongodb://127.0.0.1:27017/city_complaint_triage';

  if (isCloudOrProd && (!uri || connectionUri.includes('127.0.0.1') || connectionUri.includes('localhost'))) {
    console.error('================================================================');
    console.error('❌ [MONGODB CONFIGURATION ERROR ON RENDER]');
    console.error('Reason: The app attempted to connect to local MongoDB (127.0.0.1:27017).');
    console.error('Render runs in cloud containers and does NOT have a local MongoDB server.');
    console.error('');
    console.error('👉 HOW TO FIX:');
    console.error('1. Set up a free MongoDB database on MongoDB Atlas (https://www.mongodb.com/cloud/atlas)');
    console.error('2. Under "Network Access" in Atlas, allow access from anywhere: 0.0.0.0/0');
    console.error('3. Under "Database Access", create a user with a password (avoid special characters or URL-encode them)');
    console.error('4. Copy the connection string (format: mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/city_complaint_triage?retryWrites=true&w=majority)');
    console.error('5. Go to Render Dashboard -> Select your Web Service -> "Environment" tab');
    console.error('6. Add/Update environment variable:');
    console.error('   Key:   MONGODB_URI');
    console.error('   Value: mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/city_complaint_triage?retryWrites=true&w=majority');
    console.error('7. Click "Save changes" (Render will automatically redeploy)');
    console.error('================================================================');
    throw new Error('Missing or invalid MONGODB_URI for cloud deployment. Please configure MONGODB_URI in Render dashboard.');
  }

  try {
    const conn = await mongoose.connect(connectionUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;

