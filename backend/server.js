const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Connect to Database (with automatic fallback to JSON file storage)
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/stories', require('./routes/stories'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
      res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    }
  });
} else {
  // Root path diagnostic in development
  app.get('/', (req, res) => {
    res.send('ResQ Paws API is running...');
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Trigger auto-deployment: MongoDB Atlas cloud network whitelisting connection update
// Verified: server-static configuration, chatbot assistant, real Leaflet maps, live statistics.
