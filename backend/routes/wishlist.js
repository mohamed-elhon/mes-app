const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const wishlistController = require('../controllers/wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, wishlistController.getWishlist);

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
router.post('/add', protect, wishlistController.addToWishlist);

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove
// @access  Private
router.delete('/remove', protect, wishlistController.removeFromWishlist);

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get('/check/:productId', protect, wishlistController.checkWishlist);

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
router.delete('/clear', protect, wishlistController.clearWishlist);

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
router.get('/count', protect, wishlistController.getWishlistCount);

// @desc    Move wishlist item to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
router.post('/move-to-cart', protect, wishlistController.moveToCart);

module.exports = router;
