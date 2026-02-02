module.exports = {
  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    REVIEWING: 'reviewing',
    OFFERED: 'offered',
    ACCEPTED: 'accepted',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Offer statuses
  OFFER_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    EXPIRED: 'expired'
  },

  // User roles
  USER_ROLES: {
    CUSTOMER: 'customer',
    COMPANY: 'company',
    ADMIN: 'admin'
  },

  // Order types
  ORDER_TYPES: {
    INTERNATIONAL: 'international',
    LOCAL: 'local',
    CHINESE: 'chinese',
    SHEIN: 'shein'
  },

  // Company registration statuses
  REGISTRATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // File upload limits
  FILE_LIMITS: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE),
    ALLOWED_TYPES: process.env.ALLOWED_FILE_TYPES.split(',')
  },

  // Offer expiry
  OFFER_EXPIRY_HOURS: parseInt(process.env.OFFER_EXPIRY_HOURS)
};
