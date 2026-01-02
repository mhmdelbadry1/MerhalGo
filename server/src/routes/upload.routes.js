const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
// const { isCompany, isCustomer } = require('../middleware/roleCheck'); // Optional strict checking

/**
 * @route   POST /api/upload/order-document
 * @desc    Upload document for an order
 * @access  Private (Customer usually)
 */
router.post('/order-document',
  // auth, // Can be optional if we allow unauthenticated uploads during initial form fill before submission? Better to require auth or use temp token.
  // For now, let's keep it open or use a simpler check if needed. 
  // Company registration is public initially, so Company Docs might need to be public or semi-protected.
  // Order documents usually require customer login.
  auth, 
  upload.single('file'),
  uploadController.uploadOrderDocument
);

/**
 * @route   POST /api/upload/company-document
 * @desc    Upload document for company registration
 * @access  Public (for registration) or Private (for profile update)
 * @note    If public, we rely on file validation and rate limiting
 */
router.post('/company-document',
  // No auth middleware here because company registration is public
  upload.single('file'),
  uploadController.uploadCompanyDocument
);

/**
 * @route   POST /api/upload/company-logo
 * @desc    Upload company logo
 * @access  Private (Company)
 */
router.post('/company-logo',
  auth,
  upload.single('file'),
  uploadController.uploadCompanyLogo
);

// Refactored to use query parameters to avoid path-to-regexp PathErrors
/**
 * @route   GET /api/upload/file?bucket=x&path=y
 * @desc    Get file signed URL
 * @access  Private
 */
router.get('/file',
  auth,
  uploadController.getFile
);

/**
 * @route   DELETE /api/upload/file?bucket=x&path=y
 * @desc    Delete file
 * @access  Private
 */
router.delete('/file',
  auth,
  uploadController.deleteFile
);

module.exports = router;
