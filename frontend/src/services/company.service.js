import api from './api';

const companyService = {
  /**
   * Submit company registration request
   */
  submitRegistration: async (email, formData) => {
    const response = await api.post('/company/register', {
      email,
      formData
    });
    return response.data;
  },

  /**
   * Get company profile
   */
  getProfile: async () => {
    const response = await api.get('/company/profile');
    return response.data;
  },

  /**
   * Update company profile
   */
  updateProfile: async (updates) => {
    const response = await api.patch('/company/profile', updates);
    return response.data;
  },

  /**
   * Get available orders for bidding
   */
  getAvailableOrders: async (params = {}) => {
    const response = await api.get('/company/available-orders', { params });
    return response.data;
  },

  /**
   * Submit an offer
   */
  submitOffer: async (offerData) => {
    const response = await api.post('/company/offers', offerData);
    return response.data;
  },

  /**
   * Get company's offers
   */
  getOffers: async (params = {}) => {
    const response = await api.get('/company/offers', { params });
    return response.data;
  },

  /**
   * Update an offer
   */
  updateOffer: async (offerId, updates) => {
    const response = await api.patch(`/company/offers/${offerId}`, updates);
    return response.data;
  },

  /**
   * Get company's accepted orders
   */
  getCompanyOrders: async (params = {}) => {
    const response = await api.get('/company/orders', { params });
    return response.data;
  },

  /**
   * Delete/withdraw an offer
   */
  deleteOffer: async (offerId) => {
    const response = await api.delete(`/company/offers/${offerId}`);
    return response.data;
  },

  /**
   * Get all offers for an order (to see competing offers)
   */
  getOrderOffers: async (orderId) => {
    const response = await api.get(`/company/orders/${orderId}/offers`);
    return response.data;
  }
};

export default companyService;
