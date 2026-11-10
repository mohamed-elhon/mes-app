const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const cartController = require('../controllers/cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, cartController.getCart);

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, cartController.addToCart);

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', protect, cartController.updateCartItem);

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
router.delete('/remove', protect, cartController.removeFromCart);

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', protect, cartController.clearCart);

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
router.post('/apply-coupon', protect, cartController.applyCoupon);

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
router.get('/count', protect, cartController.getCartCount);

module.exports = router;
