const { validationResult } = require('express-validator');
const { sendError } = require('../utils/helpers');

/**
 * Middleware to handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return sendError(res, 'Validation failed', 400, formattedErrors);
  }
  
  next();
};

module.exports = validate;
