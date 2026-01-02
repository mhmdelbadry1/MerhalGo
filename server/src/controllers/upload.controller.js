const storageService = require('../services/storage.service');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Upload order document
 * POST /api/upload/order-document
 */
const uploadOrderDocument = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const result = await storageService.uploadFile(req.file, 'order-documents', 'temp');

    return sendSuccess(res, result, 'File uploaded successfully');
  } catch (error) {
    logger.error('Upload order document error:', error);
    return sendError(res, 'Failed to upload file', 500);
  }
};

/**
 * Upload company document (registration docs)
 * POST /api/upload/company-document
 */
const uploadCompanyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    // Determine subfolder based on user context or generic 'registration'
    const folder = req.user ? req.user.id : 'registration';
    
    // Note: For registration, we use 'company-documents' bucket
    const result = await storageService.uploadFile(req.file, 'company-documents', folder);

    return sendSuccess(res, result, 'File uploaded successfully');
  } catch (error) {
    logger.error('Upload company document error:', error);
    return sendError(res, 'Failed to upload file', 500);
  }
};

/**
 * Upload company logo
 * POST /api/upload/company-logo
 */
const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const result = await storageService.uploadFile(req.file, 'company-logos', req.user.id);

    return sendSuccess(res, result, 'Logo uploaded successfully');
  } catch (error) {
    logger.error('Upload company logo error:', error);
    return sendError(res, 'Failed to upload logo', 500);
  }
};

/**
 * Get file URL
 * GET /api/upload/file?bucket=x&path=y
 */
/**
 * Get file URL
 * GET /api/upload/file?bucket=x&path=y
 */
const getFile = async (req, res) => {
  try {
    let { bucket, path: filePath } = req.query;

    if (!bucket || !filePath) {
      return sendError(res, 'Bucket and file path required', 400);
    }

    // Handle URL encoding: Replace + with space, then decode URI components
    filePath = filePath.replace(/\+/g, ' ');
    // Also handle double-encoded paths
    try {
      filePath = decodeURIComponent(filePath);
    } catch (e) {
      // Path might not be encoded, use as-is
    }

    const signedUrl = await storageService.getFileUrl(bucket, filePath);

    return sendSuccess(res, { url: signedUrl }, 'File URL generated');

  } catch (error) {
    logger.error('Get file error:', error);
    return sendError(res, 'Failed to get file URL', 500);
  }
};

/**
 * Delete file
 * DELETE /api/upload/file?bucket=x&path=y
 */
const deleteFile = async (req, res) => {
  try {
    const { bucket, path } = req.query;

    if (!bucket || !path) {
      return sendError(res, 'Bucket and file path required (query params)', 400);
    }

    await storageService.deleteFile(bucket, path);

    return sendSuccess(res, null, 'File deleted successfully');
  } catch (error) {
    logger.error('Delete file error:', error);
    return sendError(res, 'Failed to delete file', 500);
  }
};

module.exports = {
  uploadOrderDocument,
  uploadCompanyDocument,
  uploadCompanyLogo,
  getFile,
  deleteFile
};
