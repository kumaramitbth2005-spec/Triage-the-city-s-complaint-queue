require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Bind HTTP port immediately so Render / cloud health checks pass
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
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

