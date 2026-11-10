const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { paginate } = require('../utils/paginate');
const { sendEmail, emailTemplates } = require('../utils/email');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode, notes } = req.body;
  
  // Check if order items are valid
  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorResponse('No order items', 400));
  }
  
  // Get user
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Validate order items and calculate prices
  let itemsPrice = 0;
  let taxPrice = 0;
  let shippingPrice = 0;
  
  const validatedOrderItems = await Promise.all(orderItems.map(async (item) => {
    const product = await Product.findById(item.product);
    
    if (!product) {
      throw new ErrorResponse(`Product ${item.product} not found`, 404);
    }
    
    if (product.stock < item.quantity) {
      throw new ErrorResponse(`Product ${product.name} is out of stock`, 400);
    }
    
    // Calculate price (use discounted price if available)
    const price = product.discount > 0 
      ? product.price - (product.price * product.discount / 100)
      : product.price;
    
    itemsPrice += price * item.quantity;
    
    return {
      product: item.product,
      quantity: item.quantity,
      price,
      color: item.color,
      size: item.size
    };
  }));
  
  // Calculate tax (5%)
  taxPrice = itemsPrice * 0.05;
  
  // Calculate shipping price
  shippingPrice = itemsPrice > 100 ? 0 : 10;
  
  // Apply coupon if provided
  let coupon = null;
  let discount = 0;
  
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    
    if (coupon) {
      if (!coupon.canBeUsed(user._id)) {
        return next(new ErrorResponse('Invalid or expired coupon', 400));
      }
      
      if (coupon.minPurchase > 0 && itemsPrice < coupon.minPurchase) {
        return next(new ErrorResponse(`Minimum purchase of $${coupon.minPurchase} required for this coupon`, 400));
      }
      
      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discount = itemsPrice * (coupon.discount / 100);
        if (coupon.maxDiscount > 0) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discount;
        if (coupon.maxDiscount > 0) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      }
      
      // Update coupon usage
      coupon.usedCount += 1;
      await coupon.save();
    }
  }
  
  // Calculate total price
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discount;
  
  // Create order
  const order = await Order.create({
    user: user._id,
    orderItems: validatedOrderItems,
    shippingAddress,
    paymentMethod,
    paymentInfo: {
      id: '',
      status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      paidAt: paymentMethod !== 'cash_on_delivery' ? new Date() : null,
      amount: totalPrice
    },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    coupon: coupon ? { code: coupon.code, discount } : null,
    isPaid: paymentMethod !== 'cash_on_delivery',
    paidAt: paymentMethod !== 'cash_on_delivery' ? new Date() : null,
    notes
  });
  
  // Update product stock
  for (const item of validatedOrderItems) {
    const product = await Product.findById(item.product);
    product.stock -= item.quantity;
    product.sold += item.quantity;
    await product.save();
  }
  
  // Clear user cart
  await Cart.findOneAndDelete({ user: user._id });
  
  // Send order confirmation email
  const orderConfirmationEmail = emailTemplates.orderConfirmation(order, user);
  await sendEmail({
    email: user.email,
    subject: 'Order Confirmation',
    message: orderConfirmationEmail
  });
  
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders for logged in user
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let query = { user: req.user.id };
  
  if (status) {
    query.orderStatus = status;
  }
  
  const results = await paginate(Order, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: {
      path: 'orderItems.product',
      select: 'name price discount images'
    }
  });
  
  res.status(200).json(results);
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  const order = await Order.findById(id)
    .populate({
      path: 'orderItems.product',
      select: 'name price discount images brand category'
    })
    .populate('user', 'firstName lastName email phone');
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  // Check if user is the owner or admin
  if (order.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status, paymentMethod, search } = req.query;
  
  let query = {};
  
  if (status) {
    query.orderStatus = status;
  }
  
  if (paymentMethod) {
    query.paymentMethod = paymentMethod;
  }
  
  if (search) {
    const users = await User.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    });
    
    const userIds = users.map(u => u._id);
    query.$or = [
      { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
      { user: { $in: userIds } },
      { _id: { $regex: search, $options: 'i' } }
    ];
  }
  
  const results = await paginate(Order, query, {
    page: Number(page),
    limit: Number(limit),
    sortBy: 'createdAt',
    sortOrder: 'desc',
    populate: [
      { path: 'user', select: 'firstName lastName email' },
      { path: 'orderItems.product', select: 'name price' }
    ]
  });
  
  res.status(200).json(results);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = await Order.findById(id);
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }
  
  // Update order status
  order.orderStatus = status;
  
  // Set delivered date if status is delivered
  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }
  
  await order.save();
  
  // Send email notification to user
  const user = await User.findById(order.user);
  if (user) {
    const statusEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your order #${order._id} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
        ${status === 'delivered' ? `<p>Your order has been delivered. Thank you for shopping with us!</p>` : ''}
        ${status === 'shipped' ? `<p>Your order is on its way. Tracking number: ${order.trackingNumber || 'N/A'}</p>` : ''}
        ${status === 'cancelled' ? `<p>Your order has been cancelled. If you have any questions, please contact us.</p>` : ''}
        <p>Best regards,<br/>E-commerce Team</p>
      </div>
    `;
    
    await sendEmail({
      email: user.email,
      subject: `Order #${order._id} Status Update`,
      message: statusEmail
    });
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order tracking number
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
exports.updateTrackingNumber = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { trackingNumber } = req.body;
  
  const order = await Order.findById(id);
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  order.trackingNumber = trackingNumber;
  await order.save();
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const order = await Order.findById(id);
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  // Check if user is the owner
  if (order.user.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized to cancel this order', 403));
  }
  
  // Check if order can be cancelled
  if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
    return next(new ErrorResponse('Cannot cancel order that is already shipped or delivered', 400));
  }
  
  // Update order status
  order.orderStatus = 'cancelled';
  order.notes = reason || order.notes;
  await order.save();
  
  // Restore product stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    product.stock += item.quantity;
    product.sold -= item.quantity;
    await product.save();
  }
  
  // Send cancellation email
  const user = await User.findById(order.user);
  if (user) {
    const cancelEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Cancelled</h2>
        <p>Hello ${user.firstName},</p>
        <p>Your order #${order._id} has been cancelled.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>We're sorry to see you go. If you have any questions, please contact us.</p>
        <p>Best regards,<br/>E-commerce Team</p>
      </div>
    `;
    
    await sendEmail({
      email: user.email,
      subject: `Order #${order._id} Cancelled`,
      message: cancelEmail
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// @desc    Get order statistics (admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  let query = {};
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  // Total orders
  const totalOrders = await Order.countDocuments(query);
  
  // Total revenue
  const totalRevenue = await Order.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  
  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: query },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);
  
  // Orders by payment method
  const ordersByPayment = await Order.aggregate([
    { $match: query },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
  ]);
  
  // Daily sales
  const dailySales = await Order.aggregate([
    { $match: query },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 },
      total: { $sum: '$totalPrice' }
    }},
    { $sort: { _id: 1 } }
  ]);
  
  // Monthly sales
  const monthlySales = await Order.aggregate([
    { $match: query },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      count: { $sum: 1 },
      total: { $sum: '$totalPrice' }
    }},
    { $sort: { _id: 1 } }
  ]);
  
  // Average order value
  const avgOrderValue = await Order.aggregate([
    { $match: query },
    { $group: { _id: null, avg: { $avg: '$totalPrice' } } }
  ]);
  
  // Pending orders
  const pendingOrders = await Order.countDocuments({ ...query, orderStatus: 'pending' });
  
  // Processing orders
  const processingOrders = await Order.countDocuments({ ...query, orderStatus: 'processing' });
  
  // Shipped orders
  const shippedOrders = await Order.countDocuments({ ...query, orderStatus: 'shipped' });
  
  // Delivered orders
  const deliveredOrders = await Order.countDocuments({ ...query, orderStatus: 'delivered' });
  
  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageOrderValue: avgOrderValue[0]?.avg || 0,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      ordersByPayment: ordersByPayment.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      dailySales,
      monthlySales,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders
    }
  });
});

// @desc    Create Stripe checkout session
// @route   POST /api/orders/create-checkout-session
// @access  Private
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  
  const order = await Order.findById(orderId)
    .populate({
      path: 'orderItems.product',
      select: 'name price discount'
    });
  
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }
  
  // Check if user is the owner
  if (order.user.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }
  
  // Prepare line items for Stripe
  const line_items = order.orderItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.name
      },
      unit_amount: Math.round(item.price * 100)
    },
    quantity: item.quantity
  }));
  
  // Add shipping and tax as separate line items
  if (order.shippingPrice > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping'
        },
        unit_amount: Math.round(order.shippingPrice * 100)
      },
      quantity: 1
    });
  }
  
  if (order.taxPrice > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax'
        },
        unit_amount: Math.round(order.taxPrice * 100)
      },
      quantity: 1
    });
  }
  
  // Apply discount if coupon was used
  if (order.coupon && order.coupon.discount > 0) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Discount (${order.coupon.code})`
        },
        unit_amount: Math.round(-order.coupon.discount * 100)
      },
      quantity: 1
    });
  }
  
  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/order-success?orderId=${order._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/order-failed?orderId=${order._id}`,
    metadata: {
      orderId: order._id.toString()
    }
  });
  
  // Update order with session ID
  order.paymentInfo.id = session.id;
  await order.save();
  
  res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url
  });
});

// @desc    Handle Stripe webhook
// @route   POST /api/orders/webhook
// @access  Public
exports.handleStripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Find order
      const order = await Order.findOne({ 'paymentInfo.id': session.id });
      
      if (order) {
        // Update payment status
        order.paymentInfo.status = 'paid';
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = 'processing';
        
        await order.save();
        
        // Send payment confirmation email
        const user = await User.findById(order.user);
        if (user) {
          const paymentEmail = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Payment Successful</h2>
              <p>Hello ${user.firstName},</p>
              <p>Your payment for order #${order._id} has been successfully processed.</p>
              <p><strong>Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p>Your order is now being processed and will be shipped soon.</p>
              <p>Best regards,<br/>E-commerce Team</p>
            </div>
          `;
          
          await sendEmail({
            email: user.email,
            subject: `Payment Successful for Order #${order._id}`,
            message: paymentEmail
          });
        }
      }
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Find order by payment intent
      const order = await Order.findOne({ 'paymentInfo.id': paymentIntent.id });
      
      if (order && !order.isPaid) {
        order.paymentInfo.status = 'paid';
        order.isPaid = true;
        order.paidAt = new Date();
        
        await order.save();
      }
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});
