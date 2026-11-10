const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, role, search } = req.query;
  
  let query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const results = await paginate(User, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    select: '-password'
  });
  
  res.status(200).json(results);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id)
    .select('-password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, address, role, isVerified } = req.body;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }
  
  // Update user
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.address = address || user.address;
  user.role = role || user.role;
  user.isVerified = isVerified !== undefined ? isVerified : user.isVerified;
  
  // Handle avatar upload
  if (req.file) {
    // Delete old avatar from cloudinary
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/users',
      transformation: [{ width: 200, height: 200, crop: 'limit' }]
    });
    
    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url
    };
  }
  
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if user has orders
  const ordersCount = await Order.countDocuments({ user: id });
  if (ordersCount > 0) {
    return next(new ErrorResponse('Cannot delete user with orders. Please delete orders first.', 400));
  }
  
  // Delete avatar from cloudinary
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }
  
  await user.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user profile (public)
// @route   GET /api/users/profile/:id
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id)
    .select('firstName lastName avatar bio createdAt');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Get user's order count
  const orderCount = await Order.countDocuments({ user: id });
  
  // Get user's review count
  const reviewCount = await Review.countDocuments({ user: id, isApproved: true });
  
  // Get user's wishlist count
  const wishlistCount = user.wishlist.length;
  
  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        orderCount,
        reviewCount,
        wishlistCount
      }
    }
  });
});

// @desc    Toggle user status (admin)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.toggleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Cannot deactivate self
  if (user._id.toString() === req.user.id.toString()) {
    return next(new ErrorResponse('Cannot change your own status', 400));
  }
  
  // Cannot deactivate admin if there's only one admin
  if (user.role === 'admin' && user.isActive) {
    const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
    if (adminCount <= 1) {
      return next(new ErrorResponse('Cannot deactivate the only active admin', 400));
    }
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user orders (admin)
// @route   GET /api/users/:id/orders
// @access  Private/Admin
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  const results = await paginate(Order, { user: id }, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: [
      { path: 'orderItems.product', select: 'name price' }
    ]
  });
  
  res.status(200).json(results);
});

// @desc    Get user reviews (admin)
// @route   GET /api/users/:id/reviews
// @access  Private/Admin
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  const results = await paginate(Review, { user: id }, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: { path: 'product', select: 'name' }
  });
  
  res.status(200).json(results);
});

// @desc    Update user role (admin)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await User.findById(id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Cannot change own role
  if (user._id.toString() === req.user.id.toString()) {
    return next(new ErrorResponse('Cannot change your own role', 400));
  }
  
  // Validate role
  if (!['user', 'admin'].includes(role)) {
    return next(new ErrorResponse('Invalid role', 400));
  }
  
  // Cannot remove all admins
  if (role === 'user' && user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new ErrorResponse('Cannot remove the only admin', 400));
    }
  }
  
  user.role = role;
  await user.save();
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user statistics (admin)
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const verifiedUsers = await User.countDocuments({ isVerified: true });
  
  // Users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  // Users by date
  const usersByDate = await User.aggregate([
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } },
    { $limit: 30 }
  ]);
  
  // Users with orders
  const usersWithOrders = await Order.distinct('user');
  const usersWithoutOrders = totalUsers - usersWithOrders.length;
  
  // Users with reviews
  const usersWithReviews = await Review.distinct('user');
  const usersWithoutReviews = totalUsers - usersWithReviews.length;
  
  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      adminUsers,
      verifiedUsers,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      usersByDate,
      usersWithOrders,
      usersWithoutOrders,
      usersWithReviews,
      usersWithoutReviews
    }
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private/Admin
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { query, page = 1, limit = 20 } = req.query;
  
  if (!query) {
    return next(new ErrorResponse('Search query is required', 400));
  }
  
  const results = await paginate(User, {
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  }, {
    page: Number(page),
    limit: Number(limit),
    select: '-password'
  });
  
  res.status(200).json(results);
});
