const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred. Please try again later.' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
