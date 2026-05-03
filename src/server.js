require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Routes
const agentRoutes = require('./routes/agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Mount routes
app.use('/agent', agentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: process.env.BMAD_ENV });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.BMAD_ENV || 'development'} mode`);
  await connectDB();
});
