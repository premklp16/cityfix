import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cityfix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cityfix_token');
      // Using window.location.href instead of navigate since we are outside React components
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
         window.location.href = '/login';
      }
    }
    
    // Extract meaningful error message
    const message = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
      
    error.extractedMessage = message;
    
    return Promise.reject(error);
  }
);

export default api;
