// src/config/axios.js

import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 5000,
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  // Success handler - just return the response
  (response) => response,
  
  // Error handler
  (error) => {
    // Log the failed URL and error details
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });

    return Promise.reject(error);
  }
);

// Export utility functions for API calls
export const api = {
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
};

export default axiosInstance;