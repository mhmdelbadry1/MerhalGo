/**
 * Send success response
 * @param {object} res - Express response object
 * @param {any} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Additional error details
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Pagination helper
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Offset and limit for database query
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

/**
 * Format pagination response
 * @param {array} data - Data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
const formatPaginatedResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Sanitize user data before sending to client
 * @param {object} user - User object
 * @returns {object} Sanitized user object
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * Normalize Gmail addresses for duplicate detection
 * Gmail ignores dots in the local part, so foo.bar@gmail.com = foobar@gmail.com
 * Also handles googlemail.com which is the same as gmail.com
 * @param {string} email - Email address to normalize
 * @returns {string} Normalized email address
 */
const normalizeGmailEmail = (email) => {
  if (!email) return email;
  
  const normalized = email.toLowerCase().trim();
  const [localPart, domain] = normalized.split('@');
  
  if (!domain) return normalized;
  
  // Check if it's a Gmail address
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove all dots from local part and standardize domain
    const cleanLocal = localPart.replace(/\./g, '');
    return `${cleanLocal}@gmail.com`;
  }
  
  return normalized;
};

module.exports = {
  sendSuccess,
  sendError,
  getPagination,
  formatPaginatedResponse,
  sanitizeUser,
  normalizeGmailEmail
};
