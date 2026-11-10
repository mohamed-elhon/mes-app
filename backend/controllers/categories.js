const Category = require('../models/Category');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');
const cloudinary = require('cloudinary').v2;

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, parent, featured, status } = req.query;
  
  // Build query
  let query = {};
  
  if (parent) {
    const parentCategory = await Category.findOne({ slug: parent });
    if (parentCategory) {
      query.parentCategory = parentCategory._id;
    }
  }
  
  if (featured) {
    query.isFeatured = featured === 'true';
  }
  
  if (status) {
    query.status = status;
  }
  
  // Get categories with pagination
  const results = await paginate(Category, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  res.status(200).json(results);
});

// @desc    Get all categories (hierarchical)
// @route   GET /api/categories/hierarchy
// @access  Public
exports.getCategoriesHierarchy = asyncHandler(async (req, res, next) => {
  // Get all active categories
  const categories = await Category.find({ status: 'active' })
    .populate({
      path: 'parentCategory',
      select: 'name slug'
    })
    .sort({ name: 1 });
  
  // Build hierarchy
  const buildHierarchy = (categories, parentId = null) => {
    return categories
      .filter(cat => cat.parentCategory && cat.parentCategory._id ? 
        cat.parentCategory._id.toString() === parentId : 
        !parentId && !cat.parentCategory
      )
      .map(category => ({
        ...category.toObject(),
        children: buildHierarchy(categories, category._id.toString())
      }));
  };
  
  const hierarchy = buildHierarchy(categories);
  
  res.status(200).json({
    success: true,
    count: hierarchy.length,
    data: hierarchy
  });
});

// @desc    Get single category
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  
  const category = await Category.findOne({ slug })
    .populate({
      path: 'parentCategory',
      select: 'name slug'
    });
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  // Get subcategories
  const subcategories = await Category.find({ parentCategory: category._id, status: 'active' })
    .sort({ name: 1 });
  
  // Get featured products in this category
  const featuredProducts = await Product.find({ category: category._id, featured: true })
    .limit(8);
  
  res.status(200).json({
    success: true,
    data: { category, subcategories, featuredProducts }
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/id/:id
// @access  Public
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, parentCategory, isFeatured, status } = req.body;
  
  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new ErrorResponse('Category already exists', 400));
  }
  
  // Check if parent category exists
  let parentCat = null;
  if (parentCategory) {
    parentCat = await Category.findById(parentCategory);
    if (!parentCat) {
      return next(new ErrorResponse('Parent category not found', 404));
    }
  }
  
  // Handle image upload
  let image = {};
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/categories',
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    });
    
    image = {
      public_id: result.public_id,
      url: result.secure_url
    };
  }
  
  const category = await Category.create({
    name,
    description,
    parentCategory: parentCat?._id,
    image,
    isFeatured: isFeatured || false,
    status: status || 'active'
  });
  
  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, parentCategory, isFeatured, status } = req.body;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  // Check if name is being changed and already exists
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new ErrorResponse('Category already exists', 400));
    }
  }
  
  // Check if parent category exists
  let parentCat = null;
  if (parentCategory) {
    parentCat = await Category.findById(parentCategory);
    if (!parentCat) {
      return next(new ErrorResponse('Parent category not found', 404));
    }
  }
  
  // Update category
  category.name = name || category.name;
  category.description = description || category.description;
  category.parentCategory = parentCat?._id || category.parentCategory;
  category.isFeatured = isFeatured !== undefined ? isFeatured : category.isFeatured;
  category.status = status || category.status;
  
  // Handle image upload
  if (req.file) {
    // Delete old image from cloudinary
    if (category.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/categories',
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    });
    
    category.image = {
      public_id: result.public_id,
      url: result.secure_url
    };
  }
  
  await category.save();
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  // Check if category has products
  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    return next(new ErrorResponse('Cannot delete category with products. Please move products to another category first.', 400));
  }
  
  // Check if category has subcategories
  const subcategoriesCount = await Category.countDocuments({ parentCategory: id });
  if (subcategoriesCount > 0) {
    return next(new ErrorResponse('Cannot delete category with subcategories. Please move subcategories first.', 400));
  }
  
  // Delete image from cloudinary
  if (category.image?.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }
  
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Toggle featured status
// @route   PUT /api/categories/:id/featured
// @access  Private/Admin
exports.toggleFeatured = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  category.isFeatured = !category.isFeatured;
  await category.save();
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Toggle status
// @route   PUT /api/categories/:id/status
// @access  Private/Admin
exports.toggleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  category.status = category.status === 'active' ? 'inactive' : 'active';
  await category.save();
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private/Admin
exports.getCategoryStats = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }
  
  // Get statistics
  const productsCount = await Product.countDocuments({ category: id });
  const totalSales = await Product.aggregate([
    { $match: { category: mongoose.Types.ObjectId(id) } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$sold'] } } } }
  ]);
  
  const totalRevenue = totalSales[0]?.total || 0;
  const totalSold = await Product.aggregate([
    { $match: { category: mongoose.Types.ObjectId(id) } },
    { $group: { _id: null, total: { $sum: '$sold' } } }
  ]);
  
  const subcategoriesCount = await Category.countDocuments({ parentCategory: id });
  
  res.status(200).json({
    success: true,
    data: {
      productsCount,
      totalRevenue,
      totalSold: totalSold[0]?.total || 0,
      subcategoriesCount
    }
  });
});
