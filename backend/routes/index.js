const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const orderRoutes = require('./orders');
const cartRoutes = require('./cart');
const wishlistRoutes = require('./wishlist');
const reviewRoutes = require('./reviews');
const couponRoutes = require('./coupons');
const dashboardRoutes = require('./dashboard');
const contactRoutes = require('./contact');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
