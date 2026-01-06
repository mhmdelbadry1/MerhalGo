const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const companyController = require('../controllers/company.controller');
const auth = require('../middleware/auth');
const { isCompany } = require('../middleware/roleCheck');
const validate = require('../middleware/validation');

/**
 * @route   POST /api/company/register
 * @desc    Submit company registration request
 * @access  Public
 */
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('formData').isObject().withMessage('Company registration data is required')
  ],
  validate,
  companyController.submitRegistration
);

/**
 * @route   GET /api/company/profile
 * @desc    Get company profile
 * @access  Private (Company only)
 */
router.get('/profile',
  auth,
  isCompany,
  companyController.getProfile
);

/**
 * @route   PATCH /api/company/profile
 * @desc    Update company profile
 * @access  Private (Company only)
 */
router.patch('/profile',
  auth,
  isCompany,
  companyController.updateProfile
);

/**
 * @route   GET /api/company/available-orders
 * @desc    Get available orders for bidding
 * @access  Private (Company only)
 */
router.get('/available-orders',
  auth,
  isCompany,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('orderType').optional().isString()
  ],
  validate,
  companyController.getAvailableOrders
);

/**
 * @route   POST /api/company/offers
 * @desc    Submit offer for an order
 * @access  Private (Company only)
 */
router.post('/offers',
  auth,
  isCompany,
  [
    body('orderId').isUUID().withMessage('معرف الطلب غير صالح'),
    body('price').isFloat({ min: 1 }).withMessage('السعر يجب أن يكون أكبر من صفر'),
    body('currency').optional().isString(),
    body('startDate').notEmpty().withMessage('تاريخ بداية الرحلة مطلوب')
      .isISO8601().withMessage('تاريخ البداية غير صالح'),
    body('endDate').notEmpty().withMessage('تاريخ وصول الشحنة مطلوب')
      .isISO8601().withMessage('تاريخ الوصول غير صالح')
      .custom((value, { req }) => {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('تاريخ الوصول يجب أن يكون بعد أو يساوي تاريخ البداية');
        }
        return true;
      }),
    body('notes').optional().isString()
  ],
  validate,
  companyController.submitOffer
);

/**
 * @route   GET /api/company/offers
 * @desc    Get company's offers
 * @access  Private (Company only)
 */
router.get('/offers',
  auth,
  isCompany,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString()
  ],
  validate,
  companyController.getOffers
);

/**
 * @route   GET /api/company/orders/:orderId/offers
 * @desc    Get all offers for an order (for companies to see competing offers)
 * @access  Private (Company only)
 */
router.get('/orders/:orderId/offers',
  auth,
  isCompany,
  [
    param('orderId').isUUID().withMessage('معرف الطلب غير صالح')
  ],
  validate,
  companyController.getOrderOffersForCompany
);

/**
 * @route   PATCH /api/company/offers/:id
 * @desc    Update offer
 * @access  Private (Company only)
 */
router.patch('/offers/:id',
  auth,
  isCompany,
  [
    param('id').isUUID().withMessage('معرف العرض غير صالح'),
    body('price').optional().isFloat({ min: 1 }).withMessage('السعر يجب أن يكون أكبر من صفر'),
    body('currency').optional().isString(),
    body('startDate').optional().isISO8601().withMessage('تاريخ البداية غير صالح'),
    body('endDate').optional().isISO8601().withMessage('تاريخ الوصول غير صالح'),
    body('notes').optional().isString()
  ],
  validate,
  companyController.updateOffer
);

/**
 * @route   GET /api/company/orders
 * @desc    Get company's accepted orders
 * @access  Private (Company only)
 */
router.get('/orders',
  auth,
  isCompany,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  companyController.getCompanyOrders
);

/**
 * @route   DELETE /api/company/offers/:id
 * @desc    Delete/withdraw an offer
 * @access  Private (Company only)
 */
router.delete('/offers/:id',
  auth,
  isCompany,
  [
    param('id').isUUID().withMessage('معرف العرض غير صالح')
  ],
  validate,
  companyController.deleteOffer
);

module.exports = router;
