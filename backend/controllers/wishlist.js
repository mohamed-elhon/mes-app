const User = require('../models/User');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const user = await User.findById(req.user.id).populate({
    path: 'wishlist',
    select: 'name price discount images ratings numOfReviews stock category',
    populate: { path: 'category', select: 'name slug' }
  });
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Paginate wishlist
  const wishlistItems = user.wishlist;
  const total = wishlistItems.length;
  const startIndex = (page - 1) * limit;
  const paginatedItems = wishlistItems.slice(startIndex, startIndex + limit);
  
  res.status(200).json({
    success: true,
    count: total,
    data: paginatedItems,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit),
      hasNext: startIndex + limit < total,
      hasPrev: page > 1
    }
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if product already in wishlist
  if (user.wishlist.includes(productId)) {
    return next(new ErrorResponse('Product already in wishlist', 400));
  }
  
  // Add to wishlist
  user.wishlist.push(productId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Product added to wishlist successfully',
    data: user.wishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.query;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Remove from wishlist
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist successfully',
    data: user.wishlist
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  const isInWishlist = user.wishlist.includes(productId);
  
  res.status(200).json({
    success: true,
    isInWishlist
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
exports.clearWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  user.wishlist = [];
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully'
  });
});

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
exports.getWishlistCount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    count: user.wishlist.length
  });
});

// @desc    Move wishlist item to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
exports.moveToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, color, size } = req.body;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Check if product is in stock
  if (product.stock < quantity) {
    return next(new ErrorResponse(`Product is out of stock. Only ${product.stock} available.`, 400));
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Remove from wishlist
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  
  // Add to cart
  const Cart = require('../models/Cart');
  let cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: []
    });
  }
  
  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && 
           item.color === color && 
           item.size === size
  );
  
  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const price = product.discount > 0 
      ? product.price - (product.price * product.discount / 100)
      : product.price;
    
    cart.items.push({
      product: productId,
      quantity,
      price,
      color,
      size
    });
  }
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    message: 'Product moved to cart successfully',
    data: {
      wishlist: user.wishlist,
      cart
    }
  });
});
