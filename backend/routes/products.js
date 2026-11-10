const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const productController = require('../controllers/products');
const upload = require('../middleware/upload');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', productController.getProducts);

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', productController.getFeaturedProducts);

// @desc    Get best selling products
// @route   GET /api/products/best-selling
// @access  Public
router.get('/best-selling', productController.getBestSellingProducts);

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
router.get('/new-arrivals', productController.getNewArrivals);

// @desc    Get products by category
// @route   GET /api/products/category/:slug
// @access  Public
router.get('/category/:slug', productController.getProductsByCategory);

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', productController.getProduct);

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.array('images', 10), productController.createProduct);

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.array('images', 10), productController.updateProduct);

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
router.put('/:id/stock', protect, authorize('admin'), productController.updateStock);

// @desc    Toggle featured status
// @route   PUT /api/products/:id/featured
// @access  Private/Admin
router.put('/:id/featured', protect, authorize('admin'), productController.toggleFeatured);

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', productController.getProductReviews);

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
router.get('/search', productController.searchProducts);

// @desc    Get products by tag
// @route   GET /api/products/tag/:tag
// @access  Public
router.get('/tag/:tag', productController.getProductsByTag);

module.exports = router;
