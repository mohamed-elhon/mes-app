const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const couponController = require('../controllers/coupons');

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
router.get('/', protect, authorize('admin'), couponController.getCoupons);

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), couponController.getCoupon);

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
router.post('/', protect, authorize('admin'), couponController.createCoupon);

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), couponController.updateCoupon);

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), couponController.deleteCoupon);

// @desc    Toggle coupon status
// @route   PUT /api/coupons/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), couponController.toggleStatus);

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
router.post('/validate', couponController.validateCoupon);

// @desc    Get user coupons
// @route   GET /api/coupons/user
// @access  Private
router.get('/user', protect, couponController.getUserCoupons);

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), couponController.getCouponStats);

module.exports = router;
