import { API_UPLOADS_URL, DEFAULT_PRODUCT_IMAGE, DEFAULT_USER_IMAGE, DEFAULT_CATEGORY_IMAGE, TAX_RATE, FREE_SHIPPING_THRESHOLD, DISCOUNT_TYPES } from './constants';

// Format price
export const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price);
};

// Format number
export const formatNumber = (number, locale = 'en-US') => {
  return new Intl.NumberFormat(locale).format(number);
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

// Format short date
export const formatShortDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

// Format date for input
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format time ago
export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
  
  return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
};

// Format rating
export const formatRating = (rating, max = 5) => {
  if (!rating) return 0;
  return Math.round(rating * 10) / 10; // Round to one decimal place
};

// Generate star rating array
export const generateStarRating = (rating, max = 5) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  return [
    ...Array(fullStars).fill('full'),
    hasHalfStar ? 'half' : '',
    ...Array(emptyStars).fill('empty'),
  ].filter(Boolean);
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// Calculate discounted price
export const calculateDiscountedPrice = (price, discount) => {
  if (!discount) return price;
  return price - (price * discount / 100);
};

// Calculate cart total
export const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
};

// Calculate cart subtotal
export const calculateCartSubtotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.discountedPrice || item.price;
    return total + (price * item.quantity);
  }, 0);
};

// Calculate tax
export const calculateTax = (subtotal, rate = TAX_RATE) => {
  return subtotal * rate;
};

// Calculate shipping
export const calculateShipping = (subtotal, shippingPrice = 0) => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return shippingPrice || 5.99; // Default shipping price
};

// Calculate order total
export const calculateOrderTotal = (subtotal, tax = 0, shipping = 0, discount = 0) => {
  return subtotal + tax + shipping - discount;
};

// Apply coupon discount
export const applyCouponDiscount = (subtotal, coupon) => {
  if (!coupon) return 0;
  
  let discount = 0;
  if (coupon.discountType === DISCOUNT_TYPES.PERCENTAGE) {
    discount = subtotal * (coupon.discount / 100);
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discount;
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }
  
  return discount;
};

// Get image URL
export const getImageUrl = (image, type = 'product') => {
  if (!image) {
    if (type === 'product') return DEFAULT_PRODUCT_IMAGE;
    if (type === 'user') return DEFAULT_USER_IMAGE;
    if (type === 'category') return DEFAULT_CATEGORY_IMAGE;
    return DEFAULT_PRODUCT_IMAGE;
  }
  
  if (image.startsWith('http')) return image;
  return `${API_UPLOADS_URL}/${image}`;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');
};

// Get full name
export const getFullName = (user) => {
  if (!user) return 'Unknown';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
};

// Get short name
export const getShortName = (name, length = 20) => {
  if (!name) return '';
  if (name.length <= length) return name;
  return name.substring(0, length) + '...';
};

// Truncate text
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Capitalize first letter
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Capitalize all words
export const capitalizeWords = (string) => {
  if (!string) return '';
  return string.split(' ').map(word => capitalizeFirstLetter(word)).join(' ');
};

// Generate slug
export const generateSlug = (string) => {
  if (!string) return '';
  return string
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Sleep function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Get query parameters
export const getQueryParams = (url = window.location.search) => {
  const params = new URLSearchParams(url);
  return Object.fromEntries(params.entries());
};

// Set query parameters
export const setQueryParams = (params, navigate) => {
  const queryString = new URLSearchParams(params).toString();
  navigate(`?${queryString}`, { replace: true });
};

// Remove query parameter
export const removeQueryParam = (param, navigate) => {
  const params = new URLSearchParams(window.location.search);
  params.delete(param);
  navigate(`?${params.toString()}`, { replace: true });
};

// Get nested value from object
export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) return defaultValue;
    value = value[key];
  }
  
  return value !== undefined ? value : defaultValue;
};

// Set nested value in object
export const setNestedValue = (obj, path, value) => {
  if (!obj || !path) return obj;
  
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return obj;
};

// Clone object
export const cloneObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

// Merge objects
export const mergeObjects = (target, source) => {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = mergeObjects(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
};

// Check if objects are equal
export const areObjectsEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!areObjectsEqual(obj1[key], obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
};

// Generate random ID
export const generateRandomId = (length = 10) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  }
};

// Download file
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Open in new tab
export const openInNewTab = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Reload page
export const reloadPage = () => {
  window.location.reload();
};

// Redirect
export const redirectTo = (url, replace = false) => {
  if (replace) {
    window.location.replace(url);
  } else {
    window.location.href = url;
  }
};

// Get browser information
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';
  
  return {
    browser,
    version: navigator.appVersion,
    platform: navigator.platform,
    userAgent,
  };
};

// Get device information
export const getDeviceInfo = () => {
  return {
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  };
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Add event listener for online/offline
export const addOnlineListener = (callback) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Validate phone
export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{10,}$/;
  return re.test(phone);
};

// Validate zip code
export const validateZipCode = (zipCode) => {
  const re = /^\d{5}(-\d{4})?$/;
  return re.test(zipCode);
};

// Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sanitize HTML
export const sanitizeHtml = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Escape HTML
export const escapeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Unescape HTML
export const unescapeHtml = (html) => {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
};

// Highlight text
export const highlightText = (text, query) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

// Get contrast color for background
export const getContrastColor = (bgColor) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  // Calculate luminance
  const getLuminance = (r, g, b) => {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  
  // Remove # if present
  const color = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;
  const { r, g, b } = hexToRgb(color);
  const luminance = getLuminance(r, g, b);
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Lighten or darken color
export const adjustColor = (color, amount) => {
  // Remove # if present
  const hex = color.startsWith('#') ? color.slice(1) : color;
  
  // Parse r, g, b values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust each component
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get color from string (for consistent coloring)
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#eab308', '#ec4899',
    '#14b8a6', '#f97316'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Export all helpers
import * as constants from './constants';
export { constants };
