const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// Controllers
const chatController = require('./controllers/chat.controller');

// Utilities
const { errorHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const sequelize = require('./config');

const app = express();

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: process.env.RECAP_DOMAIN || '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Initialize database tables
sequelize.sync();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main chat endpoint
app.post('/chat', chatController.handleChat);
app.post('/api/chat', chatController.handleChat); // Alternative endpoint

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`RECAP API running on port ${PORT}`);
});

module.exports = app;
