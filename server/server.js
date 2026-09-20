const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productsRouter = require('./routes/products');
const scrapeRouter = require('./routes/scrape');
const alertsRouter = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/alerts', alertsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mockStore: process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com'
  });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 INE PRICE TRACKER API SERVER RUNNING`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Mock Store: ${process.env.MOCK_STORE_URL || 'https://demo.inelabteamdev.com'}`);
  console.log(`====================================================`);
});
