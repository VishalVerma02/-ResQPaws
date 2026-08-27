const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads folder static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure DB connection is fully ready before routing any requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/stories', require('./routes/stories'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Uncaught Server Error:', err);
  res.status(500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Lightweight ping endpoint for keep-alive pinger
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'ResQ Paws Server is awake!' });
});

// Diagnostic endpoint to check backend database state on Vercel
app.get('/api/diag', (req, res) => {
  const { getDbType, dbState } = require('./config/db');
  res.json({
    vercel: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    mongoUriSet: !!process.env.MONGO_URI,
    mongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    dbType: getDbType(),
    dbConnected: dbState.isConnected,
    models: Object.keys(dbState.models)
  });
});

// Serve static assets (Vite React Build)
const distPath = path.join(__dirname, '../frontend/dist');
const indexPath = path.resolve(__dirname, '../frontend', 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('Serving production frontend static files from:', distPath);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      res.sendFile(indexPath);
    }
  });
} else {
  console.log('Frontend dist folder not found. Running in API diagnostic mode.');
  app.get('/', (req, res) => {
    res.send('ResQ Paws API is running...');
  });
}

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
