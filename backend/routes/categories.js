const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const categoryController = require('../controllers/categories');
const upload = require('../middleware/upload');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', categoryController.getCategories);

// @desc    Get all categories (hierarchical)
// @route   GET /api/categories/hierarchy
// @access  Public
router.get('/hierarchy', categoryController.getCategoriesHierarchy);

// @desc    Get single category
// @route   GET /api/categories/:slug
// @access  Public
router.get('/:slug', categoryController.getCategory);

// @desc    Get category by ID
// @route   GET /api/categories/id/:id
// @access  Public
router.get('/id/:id', categoryController.getCategoryById);

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.single('image'), categoryController.createCategory);

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.single('image'), categoryController.updateCategory);

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

// @desc    Toggle featured status
// @route   PUT /api/categories/:id/featured
// @access  Private/Admin
router.put('/:id/featured', protect, authorize('admin'), categoryController.toggleFeatured);

// @desc    Toggle status
// @route   PUT /api/categories/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), categoryController.toggleStatus);

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private/Admin
router.get('/:id/stats', protect, authorize('admin'), categoryController.getCategoryStats);

module.exports = router;
