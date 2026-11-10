const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Build query
  let query = { product: productId, isApproved: true };
  
  if (rating) {
    query.rating = Number(rating);
  }
  
  const results = await paginate(Review, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: [
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'product', select: 'name' }
    ]
  });
  
  res.status(200).json(results);
});

// @desc    Get single review
// @route   GET /api/reviews/single/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const review = await Review.findById(id)
    .populate('user', 'firstName lastName avatar')
    .populate('product', 'name');
  
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, title, comment, images } = req.body;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Check if user has purchased this product
  const hasPurchased = await Order.exists({
    user: req.user.id,
    orderItems: { $elemMatch: { product: productId } },
    orderStatus: { $in: ['delivered', 'shipped', 'processing'] }
  });
  
  if (!hasPurchased) {
    return next(new ErrorResponse('You must purchase this product before leaving a review', 400));
  }
  
  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user.id,
    product: productId
  });
  
  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }
  
  // Handle image uploads
  let reviewImages = [];
  if (req.files && req.files.images) {
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce/reviews',
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      });
      
      reviewImages.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }
  }
  
  const review = await Review.create({
    product: productId,
    user: req.user.id,
    rating: Number(rating),
    title,
    comment,
    images: reviewImages
  });
  
  // Update product ratings
  await Product.calculateAverageRating(productId);
  
  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;
  
  const review = await Review.findById(id);
  
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  
  // Check if user is the owner
  if (review.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }
  
  // Update review
  review.rating = rating || review.rating;
  review.title = title || review.title;
  review.comment = comment || review.comment;
  
  // Handle image uploads
  if (req.files && req.files.images) {
    // Delete old images from cloudinary
    for (const image of review.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    review.images = [];
    
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce/reviews',
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      });
      
      review.images.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }
  }
  
  await review.save();
  
  // Update product ratings
  await Product.calculateAverageRating(review.product);
  
  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const review = await Review.findById(id);
  
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  
  // Check if user is the owner or admin
  if (review.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }
  
  // Delete images from cloudinary
  for (const image of review.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }
  
  await review.deleteOne();
  
  // Update product ratings
  await Product.calculateAverageRating(review.product);
  
  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get user reviews
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  const results = await paginate(Review, { user: userId, isApproved: true }, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: [
      { path: 'product', select: 'name images' }
    ]
  });
  
  res.status(200).json(results);
});

// @desc    Like/Unlike review (helpful)
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.toggleHelpful = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const review = await Review.findById(id);
  
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  
  // Check if user already marked this review as helpful
  const hasLiked = review.helpfulVotes && review.helpfulVotes.includes(req.user.id);
  
  if (hasLiked) {
    // Remove from helpful votes
    review.helpfulVotes = review.helpfulVotes.filter(id => id.toString() !== req.user.id.toString());
    review.helpful -= 1;
  } else {
    // Add to helpful votes
    if (!review.helpfulVotes) {
      review.helpfulVotes = [];
    }
    review.helpfulVotes.push(req.user.id);
    review.helpful += 1;
  }
  
  await review.save();
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews by rating
// @route   GET /api/reviews/by-rating/:rating
// @access  Public
exports.getReviewsByRating = asyncHandler(async (req, res, next) => {
  const { rating } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const results = await paginate(Review, { rating: Number(rating), isApproved: true }, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: [
      { path: 'user', select: 'firstName lastName avatar' },
      { path: 'product', select: 'name images' }
    ]
  });
  
  res.status(200).json(results);
});

// @desc    Approve/Disapprove review (admin)
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
exports.toggleApprove = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const review = await Review.findById(id);
  
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }
  
  review.isApproved = !review.isApproved;
  await review.save();
  
  // Update product ratings
  await Product.calculateAverageRating(review.product);
  
  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, approved, productId } = req.query;
  
  let query = {};
  
  if (approved) {
    query.isApproved = approved === 'true';
  }
  
  if (productId) {
    query.product = productId;
  }
  
  const results = await paginate(Review, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: [
      { path: 'user', select: 'firstName lastName email' },
      { path: 'product', select: 'name' }
    ]
  });
  
  res.status(200).json(results);
});
