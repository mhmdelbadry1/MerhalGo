import api from './api';

const orderService = {
  /**
   * Create a new order
   */
  createOrder: async (orderType, formData) => {
    const response = await api.post('/orders', {
      orderType,
      formData
    });
    return response.data;
  },

  /**
   * Get customer's orders
   */
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order
   */
  updateOrder: async (orderId, updates) => {
    const response = await api.patch(`/orders/${orderId}`, updates);
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get offers for an order
   */
  getOrderOffers: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/offers`);
    return response.data;
  },

  /**
   * Accept an offer
   */
  acceptOffer: async (orderId, offerId) => {
    const response = await api.post(`/orders/${orderId}/accept-offer`, {
      offerId
    });
    return response.data;
  },

  /**
   * Reject an offer with reason
   */
  rejectOffer: async (orderId, offerId, reason) => {
    const response = await api.post(`/orders/${orderId}/reject-offer`, {
      offerId,
      reason
    });
    return response.data;
  }
};

export default orderService;

