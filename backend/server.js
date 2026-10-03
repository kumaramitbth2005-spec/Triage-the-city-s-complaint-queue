const path = require('path');
const dotenv = require('dotenv');

// Ensure backend/.env is loaded even when launched from project root
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Bind HTTP port immediately so Render / cloud health checks pass
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is already in use by an active backend instance.`);
    console.log(`ℹ️ Existing backend on port ${PORT} is serving API requests. Keeping process active.`);
    // Keep alive so concurrently doesn't terminate frontend
    setInterval(() => {}, 1000 * 60 * 60);
  } else {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
});

// Resilient background database connection and auto-seeding
(async () => {
  try {
    await connectDB();
    
    // Check if database needs seeding
    const Complaint = require('./src/models/Complaint');
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      console.log('ℹ️ Database is empty, auto-seeding initial complaints and clusters...');
      const seedDatabase = require('./src/seed/seed');
      await seedDatabase({ disconnect: false });
    }
  } catch (err) {
    console.error('⚠️ Database connection could not be established at startup:', err.message);
    console.log('🔄 The server will continue running and retry connection on demand.');
  }
})();

module.exports = server;

