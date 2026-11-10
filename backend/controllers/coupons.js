const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status, search } = req.query;
  
  let query = {};
  
  if (status) {
    query.isActive = status === 'active';
  }
  
  if (search) {
    query.code = { $regex: search, $options: 'i' };
  }
  
  const results = await paginate(Coupon, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  res.status(200).json(results);
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const coupon = await Coupon.findById(id)
    .populate('users', 'firstName lastName email')
    .populate('products', 'name')
    .populate('categories', 'name');
  
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discount, minPurchase, maxDiscount, startDate, endDate, 
          usageLimit, users, products, categories, description, isActive } = req.body;
  
  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return next(new ErrorResponse('Coupon code already exists', 400));
  }
  
  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    return next(new ErrorResponse('End date must be after start date', 400));
  }
  
  // Validate products
  let productIds = [];
  if (products && products.length > 0) {
    const productDocs = await Product.find({ _id: { $in: products } });
    productIds = productDocs.map(p => p._id);
    
    if (productIds.length !== products.length) {
      return next(new ErrorResponse('One or more products not found', 404));
    }
  }
  
  // Validate categories
  let categoryIds = [];
  if (categories && categories.length > 0) {
    const categoryDocs = await Category.find({ _id: { $in: categories } });
    categoryIds = categoryDocs.map(c => c._id);
    
    if (categoryIds.length !== categories.length) {
      return next(new ErrorResponse('One or more categories not found', 404));
    }
  }
  
  // Validate users
  let userIds = [];
  if (users && users.length > 0) {
    const userDocs = await User.find({ _id: { $in: users } });
    userIds = userDocs.map(u => u._id);
    
    if (userIds.length !== users.length) {
      return next(new ErrorResponse('One or more users not found', 404));
    }
  }
  
  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discount: Number(discount),
    minPurchase: Number(minPurchase) || 0,
    maxDiscount: Number(maxDiscount) || 0,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    usageLimit: Number(usageLimit) || 0,
    users: userIds,
    products: productIds,
    categories: categoryIds,
    description,
    isActive: isActive !== undefined ? isActive : true
  });
  
  res.status(201).json({
    success: true,
    data: coupon
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { code, discountType, discount, minPurchase, maxDiscount, startDate, endDate, 
          usageLimit, users, products, categories, description, isActive } = req.body;
  
  const coupon = await Coupon.findById(id);
  
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  
  // Check if code is being changed and already exists
  if (code && code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return next(new ErrorResponse('Coupon code already exists', 400));
    }
  }
  
  // Validate dates
  if (startDate && endDate) {
    if (new Date(startDate) >= new Date(endDate)) {
      return next(new ErrorResponse('End date must be after start date', 400));
    }
  }
  
  // Update coupon
  coupon.code = code?.toUpperCase() || coupon.code;
  coupon.discountType = discountType || coupon.discountType;
  coupon.discount = discount ? Number(discount) : coupon.discount;
  coupon.minPurchase = minPurchase ? Number(minPurchase) : coupon.minPurchase;
  coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : coupon.maxDiscount;
  
  if (startDate) coupon.startDate = new Date(startDate);
  if (endDate) coupon.endDate = new Date(endDate);
  
  coupon.usageLimit = usageLimit ? Number(usageLimit) : coupon.usageLimit;
  coupon.description = description || coupon.description;
  coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;
  
  // Update users if provided
  if (users) {
    const userDocs = await User.find({ _id: { $in: users } });
    coupon.users = userDocs.map(u => u._id);
  }
  
  // Update products if provided
  if (products) {
    const productDocs = await Product.find({ _id: { $in: products } });
    coupon.products = productDocs.map(p => p._id);
  }
  
  // Update categories if provided
  if (categories) {
    const categoryDocs = await Category.find({ _id: { $in: categories } });
    coupon.categories = categoryDocs.map(c => c._id);
  }
  
  await coupon.save();
  
  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const coupon = await Coupon.findById(id);
  
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  
  await coupon.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

// @desc    Toggle coupon status
// @route   PUT /api/coupons/:id/status
// @access  Private/Admin
exports.toggleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const coupon = await Coupon.findById(id);
  
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  
  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, userId, cartTotal } = req.body;
  
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  
  // Check if coupon can be used
  if (!coupon.canBeUsed(userId)) {
    return res.status(200).json({
      success: false,
      message: coupon.isExpired() ? 'Coupon has expired' : 
               coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit ? 'Coupon usage limit reached' :
               coupon.users.length > 0 && !coupon.users.includes(userId) ? 'Coupon not valid for this user' :
               !coupon.isActive ? 'Coupon is not active' : 'Invalid coupon'
    });
  }
  
  // Check minimum purchase
  if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
    return res.status(200).json({
      success: false,
      message: `Minimum purchase of $${coupon.minPurchase} required for this coupon`
    });
  }
  
  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = cartTotal * (coupon.discount / 100);
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discount;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }
  
  res.status(200).json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discount,
      discountedTotal: cartTotal - discount
    }
  });
});

// @desc    Get user coupons
// @route   GET /api/coupons/user
// @access  Private
exports.getUserCoupons = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  // Get coupons that can be used by this user
  const coupons = await Coupon.find({
    $or: [
      { users: { $size: 0 } }, // No specific users
      { users: req.user.id }    // User is in the list
    ],
    isActive: true,
    endDate: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  
  const total = await Coupon.countDocuments({
    $or: [
      { users: { $size: 0 } },
      { users: req.user.id }
    ],
    isActive: true,
    endDate: { $gt: new Date() }
  });
  
  res.status(200).json({
    success: true,
    count: total,
    data: coupons,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  });
});

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
exports.getCouponStats = asyncHandler(async (req, res, next) => {
  const totalCoupons = await Coupon.countDocuments();
  const activeCoupons = await Coupon.countDocuments({ isActive: true });
  const expiredCoupons = await Coupon.countDocuments({ endDate: { $lt: new Date() } });
  
  // Most used coupons
  const mostUsedCoupons = await Coupon.find()
    .sort({ usedCount: -1 })
    .limit(5)
    .select('code usedCount');
  
  // Coupons by discount type
  const couponsByType = await Coupon.aggregate([
    { $group: { _id: '$discountType', count: { $sum: 1 } } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      mostUsedCoupons,
      couponsByType: couponsByType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    }
  });
});
