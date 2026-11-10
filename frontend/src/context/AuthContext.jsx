import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getToken, 
  setToken, 
  removeToken, 
  getUser, 
  setUser, 
  removeUser,
  isAuthenticated as checkIsAuthenticated,
  isAdmin as checkIsAdmin,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser as fetchCurrentUser,
  updateProfile as updateUserProfile,
  updatePassword as updateUserPassword,
  initializeAuth,
} from '../utils/auth';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser());
  const [token, setTokenState] = useState(getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(checkIsAuthenticated());
  const [isAdmin, setIsAdmin] = useState(checkIsAdmin());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await initializeAuth();
        setUserState(user);
        setTokenState(getToken() || sessionStorage.getItem('ecommerce_token'));
        setIsAuthenticated(checkIsAuthenticated());
        setIsAdmin(checkIsAdmin());
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
    
    // Sync with storage changes
    const handleStorageChange = () => {
      setUserState(getUser());
      setTokenState(getToken() || sessionStorage.getItem('ecommerce_token'));
      setIsAuthenticated(checkIsAuthenticated());
      setIsAdmin(checkIsAdmin());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await authLogin(email, password, rememberMe);
      setUserState(response.user);
      setTokenState(response.token);
      setIsAuthenticated(true);
      setIsAdmin(response.user.role === 'admin');
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authRegister(userData);
      setUserState(response.user);
      setTokenState(response.token);
      setIsAuthenticated(true);
      setIsAdmin(response.user.role === 'admin');
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authLogout();
      setUserState(null);
      setTokenState(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setError(null);
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      setUserState(user);
      setIsAdmin(user.role === 'admin');
      setError(null);
      return user;
    } catch (error) {
      setError(error);
      setUserState(null);
      setTokenState(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await updateUserProfile(userData);
      setUserState(response.user);
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await updateUserPassword(currentPassword, newPassword);
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    updatePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context
export { AuthContext };
