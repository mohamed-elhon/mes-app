const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/users');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), userController.getUsers);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), userController.getUser);

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), userController.updateUser);

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

// @desc    Get user profile (public)
// @route   GET /api/users/profile/:id
// @access  Public
router.get('/profile/:id', userController.getUserProfile);

// @desc    Toggle user status (admin)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), userController.toggleStatus);

// @desc    Get user orders (admin)
// @route   GET /api/users/:id/orders
// @access  Private/Admin
router.get('/:id/orders', protect, authorize('admin'), userController.getUserOrders);

// @desc    Get user reviews (admin)
// @route   GET /api/users/:id/reviews
// @access  Private/Admin
router.get('/:id/reviews', protect, authorize('admin'), userController.getUserReviews);

// @desc    Update user role (admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), userController.updateUserRole);

// @desc    Get user statistics (admin)
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), userController.getUserStats);

// @desc    Search users
// @route   GET /api/users/search
// @access  Private/Admin
router.get('/search', protect, authorize('admin'), userController.searchUsers);

module.exports = router;
