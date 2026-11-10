const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orders');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, orderController.createOrder);

// @desc    Get all orders for logged in user
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, orderController.getMyOrders);

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, orderController.getOrder);

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, authorize('admin'), orderController.getOrders);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);

// @desc    Update order tracking number
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
router.put('/:id/tracking', protect, authorize('admin'), orderController.updateTrackingNumber);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, orderController.cancelOrder);

// @desc    Get order statistics (admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), orderController.getOrderStats);

// @desc    Create Stripe checkout session
// @route   POST /api/orders/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, orderController.createCheckoutSession);

// @desc    Handle Stripe webhook
// @route   POST /api/orders/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), orderController.handleStripeWebhook);

module.exports = router;
