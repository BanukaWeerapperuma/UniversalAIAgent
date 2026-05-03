require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const dns = require('dns');

// Set DNS servers to fix potential MongoDB SRV resolution issues
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Optional: User's intended HTTP/Socket.io setup
const http = require('http');
const { Server } = require('socket.io');

// Routes
const agentRoutes = require('./routes/agent');
const candidatesRoutes = require('./routes/candidates');
const adminRoutes = require('./routes/admin');
const dataPrivacy = require('./middleware/dataPrivacy');

const path = require('path');

const app = express();
const PORT = process.env.BMAD_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(dataPrivacy);

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.DB_URI || process.env.DB_URI === 'your_mongodb_atlas_uri') {
      console.warn('⚠️ DB_URI is not set. Skipping MongoDB connection.');
      return;
    }
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error (Check IP Whitelist):', error.message);
    // process.exit(1);
  }
};

// Mount routes
app.use('/agent', agentRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.BMAD_ENV });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.BMAD_ENV || 'development'} mode`);
  await connectDB();
});
