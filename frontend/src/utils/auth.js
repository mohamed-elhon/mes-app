import { STORAGE_KEYS, API_ENDPOINTS } from './constants';
import { apiCall } from './api';

// Get token from storage
export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Set token in storage
export const setToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

// Remove token from storage
export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

// Get user from storage
export const getUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

// Set user in storage
export const setUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Remove user from storage
export const removeUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Login user
export const login = async (email, password, rememberMe = false) => {
  const response = await apiCall('post', API_ENDPOINTS.AUTH.LOGIN, { email, password });
  
  if (rememberMe) {
    setToken(response.token);
    setUser(response.user);
  } else {
    // Store in session storage for non-persistent login
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
  }
  
  return response;
};

// Register user
export const register = async (userData) => {
  const response = await apiCall('post', API_ENDPOINTS.AUTH.REGISTER, userData);
  
  setToken(response.token);
  setUser(response.user);
  
  return response;
};

// Logout user
export const logout = async () => {
  try {
    await apiCall('post', API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API call failed:', error);
  } finally {
    removeToken();
    removeUser();
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await apiCall('get', API_ENDPOINTS.AUTH.ME);
    setUser(response.user);
    return response.user;
  } catch (error) {
    // Token might be invalid, clear it
    removeToken();
    removeUser();
    throw error;
  }
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await apiCall('put', API_ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
  setUser(response.user);
  return response;
};

// Update user password
export const updatePassword = async (currentPassword, newPassword) => {
  return apiCall('put', API_ENDPOINTS.AUTH.UPDATE_PASSWORD, { currentPassword, newPassword });
};

// Forgot password
export const forgotPassword = async (email) => {
  return apiCall('post', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
};

// Reset password
export const resetPassword = async (token, password) => {
  return apiCall('put', API_ENDPOINTS.AUTH.RESET_PASSWORD.replace(':resetToken', token), { password });
};

// Verify email
export const verifyEmail = async (token) => {
  return apiCall('get', API_ENDPOINTS.AUTH.VERIFY_EMAIL.replace(':token', token));
};

// Refresh token
export const refreshToken = async () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await apiCall('post', API_ENDPOINTS.AUTH.REFRESH_TOKEN, { token });
    setToken(response.token);
    return response.token;
  } catch (error) {
    removeToken();
    removeUser();
    return null;
  }
};

// Initialize auth (call this on app startup)
export const initializeAuth = async () => {
  const token = getToken() || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = getUser() || (sessionStorage.getItem(STORAGE_KEYS.USER) 
    ? JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER))
    : null);
  
  if (token && !user) {
    // Fetch user data if we have a token but no user
    try {
      const currentUser = await getCurrentUser();
      return currentUser;
    } catch (error) {
      // Token is invalid, clear it
      removeToken();
      removeUser();
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }
  
  return user;
};

// Check if token is expired (client-side check)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};

// Check if user has permission
export const hasPermission = (permission) => {
  const user = getUser();
  if (!user) return false;
  
  if (permission === 'admin') {
    return user.role === 'admin';
  }
  
  return true;
};

// Export auth context value
export const getAuthContextValue = () => {
  return {
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    user: getUser(),
    token: getToken(),
  };
};
