import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiCall } from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

// Create context
const AppContext = createContext(null);

// Provider component
export const AppProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await apiCall('get', API_ENDPOINTS.CATEGORIES.LIST, null, {
        params: { limit: 10 }
      });
      setCategories(categoriesResponse.data || []);
      
      // Load featured products
      const featuredResponse = await apiCall('get', API_ENDPOINTS.PRODUCTS.FEATURED, null, {
        params: { limit: 8 }
      });
      setFeaturedProducts(featuredResponse.data || []);
      
      // Load best selling products
      const bestSellingResponse = await apiCall('get', API_ENDPOINTS.PRODUCTS.BEST_SELLING, null, {
        params: { limit: 8 }
      });
      setBestSellingProducts(bestSellingResponse.data || []);
      
      // Load new arrivals
      const newArrivalsResponse = await apiCall('get', API_ENDPOINTS.PRODUCTS.NEW_ARRIVALS, null, {
        params: { limit: 8 }
      });
      setNewArrivals(newArrivalsResponse.data || []);
      
      setError(null);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Add notification
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Search products
  const searchProducts = useCallback(async (query, params = {}) => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.PRODUCTS.SEARCH, null, {
        params: { query, ...params }
      });
      return response;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }, []);

  // Get category by slug
  const getCategory = useCallback(async (slug) => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.CATEGORIES.GET.replace(':slug', slug));
      return response.data;
    } catch (error) {
      console.error('Failed to get category:', error);
      throw error;
    }
  }, []);

  // Get product by ID
  const getProduct = useCallback(async (id) => {
    try {
      const response = await apiCall('get', API_ENDPOINTS.PRODUCTS.GET.replace(':id', id));
      return response.data;
    } catch (error) {
      console.error('Failed to get product:', error);
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    categories,
    featuredProducts,
    bestSellingProducts,
    newArrivals,
    loading,
    error,
    notifications,
    loadInitialData,
    addNotification,
    removeNotification,
    clearNotifications,
    searchProducts,
    getCategory,
    getProduct,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export context
export { AppContext };
