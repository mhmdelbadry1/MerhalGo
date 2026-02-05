const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");
const validate = require("../middleware/validation");

/**
 * @route   GET /api/admin/registration-requests
 * @desc    Get company registration requests
 * @access  Private (Admin only)
 */
router.get(
  "/registration-requests",
  auth,
  isAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isString(),
  ],
  validate,
  adminController.getRegistrationRequests,
);

/**
 * @route   POST /api/admin/approve-company
 * @desc    Approve company registration
 * @access  Private (Admin only)
 */
router.post(
  "/approve-company",
  auth,
  isAdmin,
  [
    body("requestId").isUUID().withMessage("Valid request ID is required"),
    body("password").optional().isString(),
  ],
  validate,
  adminController.approveCompany,
);

/**
 * @route   POST /api/admin/reject-company
 * @desc    Reject company registration
 * @access  Private (Admin only)
 */
router.post(
  "/reject-company",
  auth,
  isAdmin,
  [
    body("requestId").isUUID().withMessage("Valid request ID is required"),
    body("reason").optional().isString(),
  ],
  validate,
  adminController.rejectCompany,
);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
router.get(
  "/orders",
  auth,
  isAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isString(),
    query("orderType").optional().isString(),
  ],
  validate,
  adminController.getAllOrders,
);

/**
 * @route   GET /api/admin/companies
 * @desc    Get all companies
 * @access  Private (Admin only)
 */
router.get(
  "/companies",
  auth,
  isAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("isApproved").optional().isBoolean(),
  ],
  validate,
  adminController.getAllCompanies,
);

/**
 * @route   GET /api/admin/statistics
 * @desc    Get platform statistics
 * @access  Private (Admin only)
 */
router.get("/statistics", auth, isAdmin, adminController.getStatistics);

/**
 * @route   PATCH /api/admin/companies/:id
 * @desc    Update company status
 * @access  Private (Admin only)
 */
router.patch(
  "/companies/:id",
  auth,
  isAdmin,
  [
    param("id").isUUID().withMessage("Invalid company ID"),
    body("isApproved").isBoolean().withMessage("Approval status is required"),
  ],
  validate,
  adminController.updateCompany,
);

/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete order
 * @access  Private (Admin only)
 */
router.delete(
  "/orders/:id",
  auth,
  isAdmin,
  [param("id").isUUID().withMessage("Invalid order ID")],
  validate,
  adminController.deleteOrder,
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get(
  "/users",
  auth,
  isAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isString(),
  ],
  validate,
  adminController.getAllUsers,
);

module.exports = router;
