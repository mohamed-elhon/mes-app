// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_UPLOADS_URL = import.meta.env.VITE_API_UPLOADS_URL || 'http://localhost:5000/uploads';

// Site Configuration
export const SITE_NAME = 'E-commerce Store';
export const SITE_DESCRIPTION = 'Buy and sell products online';
export const SITE_LOGO = '/logo.svg';
export const SITE_FAVICON = '/favicon.svg';

// Default Images
export const DEFAULT_PRODUCT_IMAGE = '/default-product.jpg';
export const DEFAULT_USER_IMAGE = '/default-user.jpg';
export const DEFAULT_CATEGORY_IMAGE = '/default-category.jpg';

// Pagination
export const PAGINATION_LIMIT = 12;
export const ADMIN_PAGINATION_LIMIT = 20;

// Product Settings
export const PRODUCTS_PER_PAGE = 12;
export const FEATURED_PRODUCTS_LIMIT = 8;
export const BEST_SELLING_LIMIT = 8;
export const NEW_ARRIVALS_LIMIT = 8;
export const RELATED_PRODUCTS_LIMIT = 4;

// Cart Settings
export const CART_STORAGE_KEY = 'ecommerce_cart';
export const WISHLIST_STORAGE_KEY = 'ecommerce_wishlist';

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export const ORDER_STATUS_TRANSLATIONS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: 'cash_on_delivery',
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
};

export const PAYMENT_METHOD_TRANSLATIONS = {
  cash_on_delivery: 'Cash on Delivery',
  credit_card: 'Credit Card',
  paypal: 'PayPal',
  stripe: 'Credit/Debit Card (Stripe)',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Sort Options
export const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest' },
  { value: 'createdAt-asc', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'ratings-desc', label: 'Top Rated' },
  { value: 'sold-desc', label: 'Best Selling' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

// Filter Options
export const FILTER_OPTIONS = {
  price: [
    { value: '0-50', label: '$0 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500+', label: '$500+' },
  ],
  rating: [
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars & Up' },
    { value: '3', label: '3 Stars & Up' },
    { value: '2', label: '2 Stars & Up' },
    { value: '1', label: '1 Star & Up' },
  ],
};

// Category Colors
export const CATEGORY_COLORS = [
  'bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100',
  'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-orange-100',
  'bg-teal-100', 'bg-cyan-100', 'bg-emerald-100', 'bg-lime-100',
];

// Social Links
export const SOCIAL_LINKS = [
  { name: 'Facebook', href: '#', icon: 'facebook' },
  { name: 'Twitter', href: '#', icon: 'twitter' },
  { name: 'Instagram', href: '#', icon: 'instagram' },
  { name: 'LinkedIn', href: '#', icon: 'linkedin' },
];

// Footer Links
export const FOOTER_LINKS = {
  shop: [
    { name: 'All Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Featured', href: '/products?featured=true' },
    { name: 'Best Selling', href: '/products?sort=best-selling' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping Policy', href: '/shipping' },
    { name: 'Return Policy', href: '/returns' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
  account: [
    { name: 'My Account', href: '/profile' },
    { name: 'My Orders', href: '/orders' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'Cart', href: '/cart' },
  ],
};

// Navigation Links
export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/products' },
  { name: 'Categories', href: '/categories' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

// Admin Navigation Links
export const ADMIN_NAV_LINKS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { name: 'Products', href: '/admin/products', icon: 'products' },
  { name: 'Categories', href: '/admin/categories', icon: 'categories' },
  { name: 'Orders', href: '/admin/orders', icon: 'orders' },
  { name: 'Users', href: '/admin/users', icon: 'users' },
  { name: 'Coupons', href: '/admin/coupons', icon: 'coupons' },
  { name: 'Reviews', href: '/admin/reviews', icon: 'reviews' },
  { name: 'Contacts', href: '/admin/contacts', icon: 'contacts' },
  { name: 'Settings', href: '/admin/settings', icon: 'settings' },
];

// User Navigation Links
export const USER_NAV_LINKS = [
  { name: 'Profile', href: '/profile', icon: 'user' },
  { name: 'My Orders', href: '/orders', icon: 'orders' },
  { name: 'Wishlist', href: '/wishlist', icon: 'heart' },
  { name: 'Cart', href: '/cart', icon: 'cart' },
  { name: 'Logout', href: '/logout', icon: 'logout' },
];

// Shipping Options
export const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, time: '3-5 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, time: '1-2 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, time: 'Next business day' },
];

// Tax Rate
export const TAX_RATE = 0.08; // 8%

// Free Shipping Threshold
export const FREE_SHIPPING_THRESHOLD = 100;

// Discount Types
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

// Review Ratings
export const REVIEW_RATINGS = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Good' },
  { value: 3, label: 'Good' },
  { value: 2, label: 'Fair' },
  { value: 1, label: 'Poor' },
];

// Contact Subjects
export const CONTACT_SUBJECTS = [
  'General Inquiry',
  'Order Issue',
  'Product Question',
  'Shipping Information',
  'Return Request',
  'Feedback',
  'Other',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  REVIEW: 'review',
  CONTACT: 'contact',
  COUPON: 'coupon',
  SYSTEM: 'system',
};

// Message Types
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'ecommerce_user',
  TOKEN: 'ecommerce_token',
  CART: 'ecommerce_cart',
  WISHLIST: 'ecommerce_wishlist',
  RECENTLY_VIEWED: 'ecommerce_recently_viewed',
  THEME: 'ecommerce_theme',
  LANGUAGE: 'ecommerce_language',
};

// Default Address
export const DEFAULT_ADDRESS = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
};

// Countries
export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'India',
  'Brazil',
  'Egypt',
  'Saudi Arabia',
  'UAE',
];

// States/Provinces (example for US)
export const STATES = {
  US: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
    'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ],
};

// Colors
export const COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White',
  'Gray', 'Silver', 'Gold', 'Pink', 'Purple', 'Orange',
  'Brown', 'Navy', 'Teal', 'Marron', 'Beige'
];

// Sizes
export const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  'One Size', '28', '30', '32', '34', '36', '38', '40', '42'
];

// Tags
export const TAGS = [
  'Sale', 'New', 'Featured', 'Best Seller', 'Limited Edition',
  'Seasonal', 'Clearance', 'Trending', 'Exclusive', 'Gift'
];

// Validation Messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 6 characters',
  confirmPassword: 'Passwords do not match',
  phone: 'Please enter a valid phone number',
  zipCode: 'Please enter a valid zip code',
  name: 'Name must be at least 2 characters',
  price: 'Price must be a positive number',
  stock: 'Stock must be a non-negative integer',
  discount: 'Discount must be between 0 and 100',
  rating: 'Rating must be between 1 and 5',
};

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  notFound: 'Resource not found.',
  unauthorized: 'Unauthorized access. Please login.',
  forbidden: 'Access denied.',
  validation: 'Please check your input and try again.',
  duplicate: 'This item already exists.',
  outOfStock: 'This product is out of stock.',
  insufficientStock: 'Not enough stock available.',
  couponInvalid: 'Invalid or expired coupon.',
  couponMinPurchase: 'Minimum purchase amount not met for this coupon.',
  paymentFailed: 'Payment failed. Please try again.',
  orderFailed: 'Failed to place order. Please try again.',
  loginFailed: 'Invalid email or password.',
  emailExists: 'Email already in use.',
  userNotFound: 'User not found.',
  productNotFound: 'Product not found.',
  categoryNotFound: 'Category not found.',
  orderNotFound: 'Order not found.',
  reviewNotFound: 'Review not found.',
  couponNotFound: 'Coupon not found.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  login: 'Login successful!',
  register: 'Registration successful!',
  logout: 'Logout successful!',
  profileUpdate: 'Profile updated successfully!',
  passwordUpdate: 'Password updated successfully!',
  passwordReset: 'Password reset successful!',
  emailVerification: 'Email verified successfully!',
  productCreate: 'Product created successfully!',
  productUpdate: 'Product updated successfully!',
  productDelete: 'Product deleted successfully!',
  categoryCreate: 'Category created successfully!',
  categoryUpdate: 'Category updated successfully!',
  categoryDelete: 'Category deleted successfully!',
  orderCreate: 'Order placed successfully!',
  orderUpdate: 'Order updated successfully!',
  orderCancel: 'Order cancelled successfully!',
  reviewCreate: 'Review submitted successfully!',
  reviewUpdate: 'Review updated successfully!',
  reviewDelete: 'Review deleted successfully!',
  couponCreate: 'Coupon created successfully!',
  couponUpdate: 'Coupon updated successfully!',
  couponDelete: 'Coupon deleted successfully!',
  userCreate: 'User created successfully!',
  userUpdate: 'User updated successfully!',
  userDelete: 'User deleted successfully!',
  contactCreate: 'Message sent successfully!',
  contactUpdate: 'Message updated successfully!',
  contactDelete: 'Message deleted successfully!',
  cartAdd: 'Item added to cart!',
  cartRemove: 'Item removed from cart!',
  cartClear: 'Cart cleared!',
  wishlistAdd: 'Item added to wishlist!',
  wishlistRemove: 'Item removed from wishlist!',
  wishlistClear: 'Wishlist cleared!',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{6,}$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  name: /^[a-zA-Z\s'-]{2,}$/,
  number: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
  url: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-profile',
    UPDATE_PASSWORD: '/auth/update-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    GET: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    PROFILE: '/users/profile/:id',
    TOGGLE_STATUS: '/users/:id/status',
    UPDATE_ROLE: '/users/:id/role',
    ORDERS: '/users/:id/orders',
    REVIEWS: '/users/:id/reviews',
    STATS: '/users/stats',
    SEARCH: '/users/search',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    FEATURED: '/products/featured',
    BEST_SELLING: '/products/best-selling',
    NEW_ARRIVALS: '/products/new-arrivals',
    CATEGORY: '/products/category/:slug',
    TAG: '/products/tag/:tag',
    GET: '/products/:id',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    TOGGLE_FEATURED: '/products/:id/featured',
    UPDATE_STOCK: '/products/:id/stock',
    REVIEWS: '/products/:id/reviews',
    SEARCH: '/products/search',
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    HIERARCHY: '/categories/hierarchy',
    GET: '/categories/:slug',
    GET_BY_ID: '/categories/id/:id',
    CREATE: '/categories',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id',
    TOGGLE_FEATURED: '/categories/:id/featured',
    TOGGLE_STATUS: '/categories/:id/status',
    STATS: '/categories/:id/stats',
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    MY_ORDERS: '/orders/my-orders',
    GET: '/orders/:id',
    CREATE: '/orders',
    UPDATE_STATUS: '/orders/:id/status',
    UPDATE_TRACKING: '/orders/:id/tracking',
    CANCEL: '/orders/:id/cancel',
    STATS: '/orders/stats',
    CHECKOUT_SESSION: '/orders/create-checkout-session',
    WEBHOOK: '/orders/webhook',
  },
  
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
    APPLY_COUPON: '/cart/apply-coupon',
    COUNT: '/cart/count',
  },
  
  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove',
    CHECK: '/wishlist/check/:productId',
    CLEAR: '/wishlist/clear',
    COUNT: '/wishlist/count',
    MOVE_TO_CART: '/wishlist/move-to-cart',
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/reviews/:productId',
    SINGLE: '/reviews/single/:id',
    CREATE: '/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
    USER: '/reviews/user/:userId',
    TOGGLE_HELPFUL: '/reviews/:id/helpful',
    BY_RATING: '/reviews/by-rating/:rating',
    TOGGLE_APPROVE: '/reviews/:id/approve',
    ALL: '/reviews',
  },
  
  // Coupons
  COUPONS: {
    LIST: '/coupons',
    GET: '/coupons/:id',
    CREATE: '/coupons',
    UPDATE: '/coupons/:id',
    DELETE: '/coupons/:id',
    TOGGLE_STATUS: '/coupons/:id/status',
    VALIDATE: '/coupons/validate',
    USER: '/coupons/user',
    STATS: '/coupons/stats',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts',
    ACTIVITIES: '/dashboard/activities',
    NOTIFICATIONS: '/dashboard/notifications',
    MARK_READ: '/dashboard/notifications/:type/read',
    SUMMARY: '/dashboard/summary',
    EXPORT: '/dashboard/export',
  },
  
  // Contact
  CONTACT: {
    CREATE: '/contact',
    LIST: '/contact',
    GET: '/contact/:id',
    UPDATE: '/contact/:id',
    DELETE: '/contact/:id',
    MARK_READ: '/contact/:id/read',
    MARK_RESOLVED: '/contact/:id/resolve',
    STATS: '/contact/stats',
  },
};
