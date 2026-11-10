const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'name price discount images stock category'
    });
  
  if (!cart) {
    return res.status(200).json({
      success: true,
      data: { items: [], totalPrice: 0, totalItems: 0 }
    });
  }
  
  // Calculate cart totals
  let totalPrice = 0;
  let totalItems = 0;
  
  const validatedItems = cart.items.map(item => {
    const price = item.product.discount > 0 
      ? item.product.price - (item.product.price * item.product.discount / 100)
      : item.product.price;
    
    totalPrice += price * item.quantity;
    totalItems += item.quantity;
    
    return {
      ...item.toObject(),
      product: {
        ...item.product.toObject(),
        discountedPrice: price
      },
      total: price * item.quantity
    };
  });
  
  res.status(200).json({
    success: true,
    data: {
      items: validatedItems,
      totalPrice,
      totalItems,
      cartId: cart._id
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
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
  
  // Get or create cart
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
    const existingItem = cart.items[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    
    // Check stock
    if (product.stock < newQuantity) {
      return next(new ErrorResponse(`Cannot add more than ${product.stock} items to cart`, 400));
    }
    
    cart.items[existingItemIndex].quantity = newQuantity;
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
    message: 'Item added to cart successfully',
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId, quantity, color, size } = req.body;
  
  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }
  
  // Check if product is in stock
  if (product.stock < quantity) {
    return next(new ErrorResponse(`Cannot update quantity. Only ${product.stock} available.`, 400));
  }
  
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }
  
  // Find item in cart
  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && 
           item.color === color && 
           item.size === size
  );
  
  if (itemIndex < 0) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }
  
  // Update quantity
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    message: 'Cart item updated successfully',
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId, color, size } = req.query;
  
  const cart = await Cart.findOne({ user: req.user.id });
  
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }
  
  // Find and remove item from cart
  cart.items = cart.items.filter(item => 
    !(item.product.toString() === productId && 
      item.color === color && 
      item.size === size)
  );
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully',
    data: cart
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ user: req.user.id });
  
  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully'
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode } = req.body;
  
  const cart = await Cart.findOne({ user: req.user.id })
    .populate({
      path: 'items.product',
      select: 'price discount'
    });
  
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }
  
  // Calculate cart total
  const cartTotal = cart.items.reduce((acc, item) => {
    const price = item.product.discount > 0 
      ? item.product.price - (item.product.price * item.product.discount / 100)
      : item.product.price;
    return acc + (price * item.quantity);
  }, 0);
  
  // Find coupon
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
  
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
  
  // Check if coupon can be used
  if (!coupon.canBeUsed(req.user.id)) {
    return next(new ErrorResponse('Invalid or expired coupon', 400));
  }
  
  // Check minimum purchase
  if (coupon.minPurchase > 0 && cartTotal < coupon.minPurchase) {
    return next(new ErrorResponse(`Minimum purchase of $${coupon.minPurchase} required for this coupon`, 400));
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
      message: `Coupon applied! You save $${discount.toFixed(2)}`
    },
    discountedTotal: cartTotal - discount
  });
});

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  
  const count = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  
  res.status(200).json({
    success: true,
    count
  });
});
