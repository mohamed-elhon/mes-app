import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  calculateCartTotal, 
  calculateCartSubtotal, 
  calculateTax, 
  calculateShipping,
  calculateOrderTotal,
  applyCouponDiscount,
} from '../utils/helpers';
import { apiCall, apiPaginatedCall } from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS, TAX_RATE, FREE_SHIPPING_THRESHOLD } from '../utils/constants';

// Create context
const CartContext = createContext(null);

// Provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart from API and local storage
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch cart from API
      const cartData = await apiCall('get', API_ENDPOINTS.CART.GET);
      
      if (cartData && cartData.data) {
        const { items: cartItems, totalPrice, totalItems } = cartData.data;
        
        // Calculate totals
        const subtotal = calculateCartSubtotal(cartItems);
        const tax = calculateTax(subtotal, TAX_RATE);
        const shipping = calculateShipping(subtotal);
        const total = calculateOrderTotal(subtotal, tax, shipping, discount);
        
        setCart(cartData.data);
        setItems(cartItems);
        setSubtotal(subtotal);
        setTax(tax);
        setShipping(shipping);
        setTotal(total);
        setCount(totalItems || cartItems.reduce((acc, item) => acc + item.quantity, 0));
      } else {
        // No cart exists
        setCart(null);
        setItems([]);
        setSubtotal(0);
        setTax(0);
        setShipping(0);
        setTotal(0);
        setCount(0);
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setError(error);
      // Fallback to empty cart
      setCart(null);
      setItems([]);
      setSubtotal(0);
      setTax(0);
      setShipping(0);
      setTotal(0);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [discount]);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Recalculate totals when items or coupon change
  useEffect(() => {
    const subtotal = calculateCartSubtotal(items);
    const tax = calculateTax(subtotal, TAX_RATE);
    const shipping = calculateShipping(subtotal);
    const couponDiscount = coupon ? applyCouponDiscount(subtotal, coupon) : 0;
    const total = calculateOrderTotal(subtotal, tax, shipping, couponDiscount);
    
    setSubtotal(subtotal);
    setTax(tax);
    setShipping(shipping);
    setDiscount(couponDiscount);
    setTotal(total);
    setCount(items.reduce((acc, item) => acc + item.quantity, 0));
  }, [items, coupon]);

  // Add item to cart
  const addToCart = useCallback(async (productId, quantity = 1, color = null, size = null) => {
    try {
      setLoading(true);
      
      const response = await apiCall('post', API_ENDPOINTS.CART.ADD, {
        productId,
        quantity,
        color,
        size
      });
      
      // Reload cart
      await loadCart();
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Update cart item quantity
  const updateItemQuantity = useCallback(async (productId, quantity, color = null, size = null) => {
    try {
      setLoading(true);
      
      const response = await apiCall('put', API_ENDPOINTS.CART.UPDATE, {
        productId,
        quantity,
        color,
        size
      });
      
      // Reload cart
      await loadCart();
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId, color = null, size = null) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('productId', productId);
      if (color) params.append('color', color);
      if (size) params.append('size', size);
      
      const response = await apiCall('delete', `${API_ENDPOINTS.CART.REMOVE}?${params.toString()}`);
      
      // Reload cart
      await loadCart();
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await apiCall('delete', API_ENDPOINTS.CART.CLEAR);
      
      // Clear cart state
      setCart(null);
      setItems([]);
      setCoupon(null);
      setDiscount(0);
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply coupon
  const applyCoupon = useCallback(async (couponCode) => {
    try {
      setLoading(true);
      
      const response = await apiCall('post', API_ENDPOINTS.CART.APPLY_COUPON, {
        couponCode
      });
      
      if (response.success) {
        setCoupon(response.coupon);
      }
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      setCoupon(null);
      setDiscount(0);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setDiscount(0);
  }, []);

  // Get cart count
  const getCartCount = useCallback(async () => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.CART.COUNT);
      setCount(response.count || 0);
      return response.count || 0;
    } catch (error) {
      console.error('Failed to get cart count:', error);
      return count;
    }
  }, [count]);

  // Check if product is in cart
  const isInCart = useCallback((productId, color = null, size = null) => {
    return items.some(item => 
      item.product._id === productId &&
      (!color || item.color === color) &&
      (!size || item.size === size)
    );
  }, [items]);

  // Get item quantity in cart
  const getItemQuantity = useCallback((productId, color = null, size = null) => {
    const item = items.find(item => 
      item.product._id === productId &&
      (!color || item.color === color) &&
      (!size || item.size === size)
    );
    return item ? item.quantity : 0;
  }, [items]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    cart,
    items,
    subtotal,
    tax,
    shipping,
    coupon,
    discount,
    total,
    count,
    loading,
    error,
    loadCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartCount,
    isInCart,
    getItemQuantity,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Export context
export { CartContext };
