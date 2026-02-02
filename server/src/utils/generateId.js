/**
 * Generate a unique order number based on order type
 * @param {string} orderType - Type of order (international, local, chinese, shein)
 * @returns {string} Formatted order number
 */
const generateOrderNumber = (orderType) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const prefixes = {
    'international': 'INTL',
    'local': 'LOCAL',
    'chinese': 'CN',
    'shein': 'SHEIN'
  };
  
  const prefix = prefixes[orderType] || 'ORD';
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate a unique document ID
 * @returns {string} Document ID
 */
const generateDocumentId = () => {
  return `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = {
  generateOrderNumber,
  generateDocumentId
};
