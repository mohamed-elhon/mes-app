import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear user data
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API calls
export const apiCall = async (method, url, data = null, config = {}) => {
  try {
    const response = await api[method](url, data, config);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error ||
                   error.message ||
                   'An error occurred';
    
    // Extract validation errors
    let errors = {};
    if (error.response?.data?.errors) {
      errors = error.response.data.errors.reduce((acc, err) => {
        acc[err.path] = err.msg;
        return acc;
      }, {});
    }
    
    throw { message, errors, status: error.response?.status };
  }
};

// Helper function for paginated requests
export const apiPaginatedCall = async (url, params = {}, config = {}) => {
  try {
    const response = await api.get(url, { params, ...config });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error ||
                   error.message ||
                   'An error occurred';
    throw { message, status: error.response?.status };
  }
};

// Upload file helper
export const uploadFile = async (url, file, fieldName = 'image', additionalData = {}) => {
  try {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error ||
                   error.message ||
                   'File upload failed';
    throw { message, status: error.response?.status };
  }
};

// Upload multiple files helper
export const uploadMultipleFiles = async (url, files, fieldName = 'images', additionalData = {}) => {
  try {
    const formData = new FormData();
    
    // Append files
    files.forEach(file => {
      formData.append(fieldName, file);
    });
    
    // Append additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error ||
                   error.message ||
                   'File upload failed';
    throw { message, status: error.response?.status };
  }
};

// Export api instance and helper functions
export default api;
export { api as axiosInstance };
