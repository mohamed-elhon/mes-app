const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 12, category, search, minPrice, maxPrice, rating, featured, sortBy, sortOrder, ...filters } = req.query;
  
  // Build query
  let query = {};
  
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  if (rating) {
    query.ratings = { $gte: Number(rating) };
  }
  
  if (featured) {
    query.featured = featured === 'true';
  }
  
  // Add additional filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      if (key === 'colors' || key === 'sizes' || key === 'tags') {
        query[key] = { $in: [filters[key]] };
      } else {
        query[key] = filters[key];
      }
    }
  });
  
  // Define sort
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }
  
  // Execute query with pagination
  const results = await paginate(Product, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: Object.keys(sort)[0],
    sortOrder: Object.values(sort)[0] === 1 ? 'asc' : 'desc',
    populate: 'category',
    select: '-createdAt -updatedAt'
  });
  
  res.status(200).json(results);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const { limit = 8 } = req.query;
  
  const products = await Product.find({ featured: true })
    .populate('category')
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get best selling products
// @route   GET /api/products/best-selling
// @access  Public
exports.getBestSellingProducts = asyncHandler(async (req, res, next) => {
  const { limit = 8 } = req.query;
  
  const products = await Product.find()
    .populate('category')
    .sort({ sold: -1, ratings: -1 })
    .limit(Number(limit));
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = asyncHandler(async (req, res, next) => {
  const { limit = 8 } = req.query;
  
  const products = await Product.find()
    .populate('category')
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:slug
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const { page = 1, limit = 12, sortBy, sortOrder, ...filters } = req.query;
  
  // Find category
  const category = await Category.findOne({ slug });
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  // Build query
  let query = { category: category._id };
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }
  
  if (filters.rating) {
    query.ratings = { $gte: Number(filters.rating) };
  }
  
  // Define sort
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }
  
  // Execute query with pagination
  const results = await paginate(Product, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: Object.keys(sort)[0],
    sortOrder: Object.values(sort)[0] === 1 ? 'asc' : 'desc',
    populate: 'category'
  });
  
  res.status(200).json(results);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findById(id)
    .populate('category')
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: 'firstName lastName avatar' }
    });
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Get related products
  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id }
  })
    .populate('category')
    .limit(4);
  
  res.status(200).json({
    success: true,
    data: { product, relatedProducts }
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, discount, category, brand, stock, colors, sizes, tags, featured, shipping } = req.body;
  
  // Check if category exists
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  // Handle images
  let images = [];
  if (req.files && req.files.images) {
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce/products',
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      });
      
      images.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }
  }
  
  // Calculate discounted price
  const discountedPrice = price - (price * discount / 100);
  
  const product = await Product.create({
    name,
    description,
    price,
    discount,
    discountedPrice,
    category,
    brand,
    stock,
    colors,
    sizes,
    tags,
    featured: featured || false,
    shipping: shipping !== undefined ? shipping : true,
    images
  });
  
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, discount, category, brand, stock, colors, sizes, tags, featured, shipping } = req.body;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Check if category exists
  if (category) {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return next(new ErrorResponse('Category not found', 404));
    }
  }
  
  // Update product
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.discount = discount || product.discount;
  product.discountedPrice = product.price - (product.price * (product.discount || 0) / 100);
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.stock = stock !== undefined ? stock : product.stock;
  product.colors = colors || product.colors;
  product.sizes = sizes || product.sizes;
  product.tags = tags || product.tags;
  product.featured = featured !== undefined ? featured : product.featured;
  product.shipping = shipping !== undefined ? shipping : product.shipping;
  
  // Handle images
  if (req.files && req.files.images) {
    // Delete old images from cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    product.images = [];
    
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'ecommerce/products',
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      });
      
      product.images.push({
        public_id: result.public_id,
        url: result.secure_url
      });
    }
  }
  
  await product.save();
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Delete images from cloudinary
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }
  
  await product.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
exports.updateStock = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { stock } = req.body;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  product.stock = stock;
  await product.save();
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Toggle featured status
// @route   PUT /api/products/:id/featured
// @access  Private/Admin
exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  product.featured = !product.featured;
  await product.save();
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const product = await Product.findById(id);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  const results = await paginate(Review, { product: id, isApproved: true }, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: { path: 'user', select: 'firstName lastName avatar' }
  });
  
  res.status(200).json(results);
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = asyncHandler(async (req, res, next) => {
  const { query, page = 1, limit = 12 } = req.query;
  
  if (!query) {
    return next(new ErrorResponse('Search query is required', 400));
  }
  
  const results = await paginate(Product, {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } }
    ]
  }, {
    page: Number(page),
    limit: Number(limit),
    populate: 'category'
  });
  
  res.status(200).json(results);
});

// @desc    Get products by tag
// @route   GET /api/products/tag/:tag
// @access  Public
exports.getProductsByTag = asyncHandler(async (req, res, next) => {
  const { tag } = req.params;
  const { page = 1, limit = 12 } = req.query;
  
  const results = await paginate(Product, { tags: tag }, {
    page: Number(page),
    limit: Number(limit),
    populate: 'category'
  });
  
  res.status(200).json(results);
});
