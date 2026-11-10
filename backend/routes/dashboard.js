const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), dashboardController.getStats);

// @desc    Get dashboard charts data
// @route   GET /api/dashboard/charts
// @access  Private/Admin
router.get('/charts', protect, authorize('admin'), dashboardController.getChartsData);

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private/Admin
router.get('/activities', protect, authorize('admin'), dashboardController.getActivities);

// @desc    Get system notifications
// @route   GET /api/dashboard/notifications
// @access  Private/Admin
router.get('/notifications', protect, authorize('admin'), dashboardController.getNotifications);

// @desc    Mark notification as read
// @route   PUT /api/dashboard/notifications/:type/read
// @access  Private/Admin
router.put('/notifications/:type/read', protect, authorize('admin'), dashboardController.markNotificationAsRead);

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private/Admin
router.get('/summary', protect, authorize('admin'), dashboardController.getSummary);

// @desc    Export dashboard data
// @route   GET /api/dashboard/export
// @access  Private/Admin
router.get('/export', protect, authorize('admin'), dashboardController.exportData);

module.exports = router;
