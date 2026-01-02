const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer
 * @access  Public
 */
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('phoneCountryCode').optional().trim(),
    body('whatsapp').optional().trim(),
    body('whatsappCountryCode').optional().trim(),
    body('address').optional().trim()
  ],
  validate,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  validate,
  authController.refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, authController.getCurrentUser);

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/profile',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim(),
    body('address').optional().trim()
  ],
  validate,
  authController.updateProfile
);

/**
 * @route   POST /api/auth/update-password
 * @desc    Update password
 * @access  Private
 */
router.post('/update-password',
  auth,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  authController.updatePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  validate,
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.post('/update-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  authController.updatePassword
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with code
 * @access  Public
 */
router.post('/verify-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
  ],
  validate,
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification code
 * @access  Public
 */
router.post('/resend-verification',
  [
    // Force restart comment
    body('email').isEmail().withMessage('Valid email is required')
  ],
  validate,
  authController.resendVerificationCode
);

module.exports = router;
