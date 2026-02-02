import api from './api';

const authService = {
  /**
   * Register a new customer
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone,
      phoneCountryCode: userData.phoneCountryCode || '+20',
      whatsapp: userData.whatsapp || userData.phone,
      whatsappCountryCode: userData.whatsappCountryCode || '+20',
      address: userData.address
    });
    return response.data;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    const { data } = response.data;
    
    // Store tokens and user data
    if (data.session) {
      localStorage.setItem('mirhal_access_token', data.session.access_token);
      localStorage.setItem('mirhal_refresh_token', data.session.refresh_token);
    }
    
    if (data.user) {
      localStorage.setItem('mirhal_user', JSON.stringify(data.user));
      localStorage.setItem('mirhal_user_type', data.user.role);
    }
    
    return data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('mirhal_refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await api.post('/auth/refresh-token', { refreshToken });
    const { session } = response.data.data;

    if (session) {
      localStorage.setItem('mirhal_access_token', session.access_token);
      localStorage.setItem('mirhal_refresh_token', session.refresh_token);
      return session.access_token;
    }
    throw new Error('Failed to refresh token');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('mirhal_access_token');
      localStorage.removeItem('mirhal_refresh_token');
      localStorage.removeItem('mirhal_user');
      localStorage.removeItem('mirhal_user_type');
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/update-password', { currentPassword, newPassword });
    
    // If backend returns new session, update local storage immediately
    if (response.data.data && response.data.data.session) {
      const { session } = response.data.data;
      localStorage.setItem('mirhal_access_token', session.access_token);
      localStorage.setItem('mirhal_refresh_token', session.refresh_token);
    }
    
    return response.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Verify customer email
   */
  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  /**
   * Resend verification code
   */
  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }
};

export default authService;
