import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mirhal_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if it's an auth endpoint (login/register)
      if (originalRequest.url.includes('/auth/')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        // We use a circular dependency workaround or direct import if possible, 
        // but here we can't import authService easily if it imports api.
        // So we manually make the call or use a clean solution.
        // Simplest: direct fetch to avoid circular dep with axios instance
        const refreshToken = localStorage.getItem('mirhal_refresh_token');
        
        if (refreshToken) {
           const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`, {
             refreshToken
           });
           
           const { session } = response.data.data;
           
           if (session) {
             localStorage.setItem('mirhal_access_token', session.access_token);
             localStorage.setItem('mirhal_refresh_token', session.refresh_token);
             
             // Update header and retry original request
             originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
             return api(originalRequest);
           }
        }
      } catch (refreshError) {
        // Refresh failed, fall through to logout
        console.error('Token refresh failed:', refreshError);
      }

      // Clear tokens and redirect to login
      localStorage.removeItem('mirhal_access_token');
      localStorage.removeItem('mirhal_refresh_token');
      localStorage.removeItem('mirhal_user');
      localStorage.removeItem('mirhal_user_type');
      
      window.location.href = '/';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
