const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const contactController = require('../controllers/contact');

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
router.post('/', contactController.createContact);

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, authorize('admin'), contactController.getContacts);

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), contactController.getContact);

// @desc    Update contact message
// @route   PUT /api/contact/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), contactController.updateContact);

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), contactController.deleteContact);

// @desc    Mark contact as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, authorize('admin'), contactController.markAsRead);

// @desc    Mark contact as resolved
// @route   PUT /api/contact/:id/resolve
// @access  Private/Admin
router.put('/:id/resolve', protect, authorize('admin'), contactController.markAsResolved);

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), contactController.getContactStats);

module.exports = router;
