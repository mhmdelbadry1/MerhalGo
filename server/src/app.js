const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL?.replace(/\/$/, ''),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, // Increased for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MirhalGO API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/company', require('./routes/company.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

module.exports = app;
