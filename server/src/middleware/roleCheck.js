const { sendError } = require('../utils/helpers');
const { USER_ROLES } = require('../config/constants');

/**
 * Role-based access control middleware factory
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Insufficient permissions.', 403);
    }

    next();
  };
};

// Predefined role checkers
const isCustomer = checkRole([USER_ROLES.CUSTOMER]);
const isCompany = checkRole([USER_ROLES.COMPANY]);
const isAdmin = checkRole([USER_ROLES.ADMIN]);
const isCustomerOrAdmin = checkRole([USER_ROLES.CUSTOMER, USER_ROLES.ADMIN]);
const isCompanyOrAdmin = checkRole([USER_ROLES.COMPANY, USER_ROLES.ADMIN]);

module.exports = {
  checkRole,
  isCustomer,
  isCompany,
  isAdmin,
  isCustomerOrAdmin,
  isCompanyOrAdmin
};
