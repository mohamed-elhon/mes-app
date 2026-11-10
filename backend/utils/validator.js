const { body, validationResult } = require('express-validator');

// User validation
const validateUser = [
  body('firstName').notEmpty().withMessage('First name is required').isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').notEmpty().withMessage('Last name is required').isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Product validation
const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('price').notEmpty().withMessage('Price is required').isNumeric().withMessage('Price must be a number').isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category ID'),
  body('stock').notEmpty().withMessage('Stock is required').isNumeric().withMessage('Stock must be a number').isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  body('discount').optional().isNumeric().withMessage('Discount must be a number').isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Category validation
const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required').isLength({ max: 50 }).withMessage('Category name cannot exceed 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Order validation
const validateOrder = [
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required').isIn(['cash_on_delivery', 'credit_card', 'paypal', 'stripe']).withMessage('Invalid payment method'),
  body('orderItems').isArray({ min: 1 }).withMessage('Order items are required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Review validation
const validateReview = [
  body('rating').notEmpty().withMessage('Rating is required').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required').isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body('product').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Coupon validation
const validateCoupon = [
  body('code').notEmpty().withMessage('Coupon code is required').isLength({ max: 20 }).withMessage('Coupon code cannot exceed 20 characters'),
  body('discount').notEmpty().withMessage('Discount is required').isNumeric().withMessage('Discount must be a number').isFloat({ min: 0 }).withMessage('Discount cannot be negative'),
  body('discountType').notEmpty().withMessage('Discount type is required').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Auth validation
const validateAuth = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateUser,
  validateProduct,
  validateCategory,
  validateOrder,
  validateReview,
  validateCoupon,
  validateAuth
};
