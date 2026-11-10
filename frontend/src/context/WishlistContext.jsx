import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiCall } from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

// Create context
const WishlistContext = createContext(null);

// Provider component
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load wishlist from API
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await apiCall('get', API_ENDPOINTS.WISHLIST.GET);
      
      if (response && response.data) {
        setWishlist(response.data);
        setProducts(response.data);
        setCount(response.count || response.data.length);
      } else {
        setWishlist([]);
        setProducts([]);
        setCount(0);
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setError(error);
      // Fallback to empty wishlist
      setWishlist([]);
      setProducts([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      
      const response = await apiCall('post', API_ENDPOINTS.WISHLIST.ADD, {
        productId
      });
      
      // Reload wishlist
      await loadWishlist();
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadWishlist]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('productId', productId);
      
      const response = await apiCall('delete', `${API_ENDPOINTS.WISHLIST.REMOVE}?${params.toString()}`);
      
      // Reload wishlist
      await loadWishlist();
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadWishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(async (productId) => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.WISHLIST.CHECK.replace(':productId', productId));
      return response.isInWishlist || false;
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      // Fallback to checking local state
      return wishlist.some(item => item._id === productId || item.id === productId);
    }
  }, [wishlist]);

  // Get wishlist count
  const getWishlistCount = useCallback(async () => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.WISHLIST.COUNT);
      setCount(response.count || 0);
      return response.count || 0;
    } catch (error) {
      console.error('Failed to get wishlist count:', error);
      return count;
    }
  }, [count]);

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await apiCall('delete', API_ENDPOINTS.WISHLIST.CLEAR);
      
      // Clear wishlist state
      setWishlist([]);
      setProducts([]);
      setCount(0);
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Move to cart
  const moveToCart = useCallback(async (productId, quantity = 1, color = null, size = null) => {
    try {
      setLoading(true);
      
      const response = await apiCall('post', API_ENDPOINTS.WISHLIST.MOVE_TO_CART, {
        productId,
        quantity,
        color,
        size
      });
      
      // Reload wishlist
      await loadWishlist();
      
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadWishlist]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    wishlist,
    products,
    count,
    loading,
    error,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    moveToCart,
    clearError,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Export context
export { WishlistContext };
