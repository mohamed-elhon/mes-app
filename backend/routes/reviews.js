const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reviewController = require('../controllers/reviews');
const upload = require('../middleware/upload');

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
router.get('/:productId', reviewController.getReviews);

// @desc    Get single review
// @route   GET /api/reviews/single/:id
// @access  Public
router.get('/single/:id', reviewController.getReview);

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, upload.array('images', 5), reviewController.createReview);

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, upload.array('images', 5), reviewController.updateReview);

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, reviewController.deleteReview);

// @desc    Get user reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
router.get('/user/:userId', reviewController.getUserReviews);

// @desc    Like/Unlike review (helpful)
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, reviewController.toggleHelpful);

// @desc    Get reviews by rating
// @route   GET /api/reviews/by-rating/:rating
// @access  Public
router.get('/by-rating/:rating', reviewController.getReviewsByRating);

// @desc    Approve/Disapprove review (admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), reviewController.toggleApprove);

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
router.get('/', protect, authorize('admin'), reviewController.getAllReviews);

module.exports = router;
