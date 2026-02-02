const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const { isCustomer } = require('../middleware/roleCheck');
const validate = require('../middleware/validation');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Customer only)
 */
router.post('/',
  auth,
  isCustomer,
  [
    body('orderType').isIn(['international', 'local', 'chinese', 'shein']).withMessage('Invalid order type'),
    body('formData').isObject().withMessage('Form data is required')
  ],
  validate,
  orderController.createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get customer's orders
 * @access  Private (Customer only)
 */
router.get('/',
  auth,
  isCustomer,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
    query('orderType').optional().isString()
  ],
  validate,
  orderController.getOrders
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (Customer only)
 */
router.get('/:id',
  auth,
  isCustomer,
  [
    param('id').isUUID().withMessage('Invalid order ID')
  ],
  validate,
  orderController.getOrderById
);

/**
 * @route   PATCH /api/orders/:id
 * @desc    Update order
 * @access  Private (Customer only)
 */
router.patch('/:id',
  auth,
  isCustomer,
  [
    param('id').isUUID().withMessage('Invalid order ID'),
    body('formData').optional().isObject(),
    body('notes').optional().isString()
  ],
  validate,
  orderController.updateOrder
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel order
 * @access  Private (Customer only)
 */
router.delete('/:id',
  auth,
  isCustomer,
  [
    param('id').isUUID().withMessage('Invalid order ID')
  ],
  validate,
  orderController.cancelOrder
);

/**
 * @route   GET /api/orders/:id/offers
 * @desc    Get offers for an order
 * @access  Private (Customer only)
 */
router.get('/:id/offers',
  auth,
  isCustomer,
  [
    param('id').isUUID().withMessage('Invalid order ID')
  ],
  validate,
  orderController.getOrderOffers
);

/**
 * @route   POST /api/orders/:id/accept-offer
 * @desc    Accept an offer for an order
 * @access  Private (Customer only)
 */
router.post('/:id/accept-offer',
  auth,
  isCustomer,
  [
    param('id').isUUID().withMessage('Invalid order ID'),
    body('offerId').isUUID().withMessage('Invalid offer ID')
  ],
  validate,
  orderController.acceptOffer
);

/**
 * @route POST /api/orders/:id/reject-offer
 * @desc Reject an offer with reason
 * @access Private (Customer)
 */
router.post('/:id/reject-offer',
  auth,
  isCustomer,
  [
    param('id').isUUID().withMessage('Invalid order ID'),
    body('offerId').isUUID().withMessage('Invalid offer ID'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  validate,
  orderController.rejectOffer
);

module.exports = router;

