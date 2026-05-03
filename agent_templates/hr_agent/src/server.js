require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

// Set DNS servers to fix potential MongoDB SRV resolution issues
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.BMAD_PORT || 3000;

// Routes
const agentRoutes = require('./routes/agent');
const candidatesRoutes = require('./routes/candidates');
const adminRoutes = require('./routes/admin');
const dataPrivacy = require('./middleware/dataPrivacy');

// Middleware
app.use(cors());
app.use(express.json());
app.use(dataPrivacy);

// Attach io to request for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Mount routes
app.use('/agent', agentRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.BMAD_ENV });
});

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
  }
};

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('📱 A user connected to real-time dashboard');
});

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.BMAD_ENV || 'development'} mode`);
  await connectDB();
});

module.exports = { io, server, app };
