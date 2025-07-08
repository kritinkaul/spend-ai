const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

// Import routes
const healthRoute = require('./routes/health');
const uploadRoute = require('./routes/upload');
const summaryRoute = require('./routes/summary');
const analyticsRoute = require('./routes/analytics');
const transactionsRoute = require('./routes/transactions');
const analysisRoute = require('./routes/analysis');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware - CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Development origins
    const developmentOrigins = [
      'http://localhost:3000',
      'http://localhost:3002', 
      'http://localhost:3003'
    ];
    
    // Check if origin is allowed
    if (developmentOrigins.includes(origin) || 
        origin.endsWith('.vercel.app') || 
        (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').includes(origin))) {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.log('❌ CORS rejected origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoute);
app.use('/api', uploadRoute);
app.use('/api', summaryRoute);
app.use('/api', analyticsRoute);
app.use('/api', transactionsRoute);
app.use('/api', analysisRoute);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SpendAI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/upload`);
  console.log(`   GET  /api/summary`);
  console.log(`   GET  /api/analytics`);
  console.log(`   GET  /api/transactions`);
  console.log(`   GET  /api/transactions/categories`);
  console.log(`   DELETE /api/analysis/all-data`);
});

module.exports = app; 