import api from "./api";

const adminService = {
  /**
   * Get company registration requests
   */
  getRegistrationRequests: async (params = {}) => {
    const response = await api.get("/admin/registration-requests", { params });
    return response.data;
  },

  /**
   * Approve company registration
   */
  approveCompany: async (requestId, password) => {
    const response = await api.post("/admin/approve-company", {
      requestId,
      password,
    });
    return response.data;
  },

  /**
   * Reject company registration
   */
  rejectCompany: async (requestId, reason) => {
    const response = await api.post("/admin/reject-company", {
      requestId,
      reason,
    });
    return response.data;
  },

  /**
   * Get all orders
   */
  getAllOrders: async (params = {}) => {
    const response = await api.get("/admin/orders", { params });
    return response.data;
  },

  /**
   * Get all companies
   */
  getAllCompanies: async (params = {}) => {
    const response = await api.get("/admin/companies", { params });
    return response.data;
  },

  /**
   * Get platform statistics
   */
  getStatistics: async () => {
    const response = await api.get("/admin/statistics");
    return response.data;
  },

  /**
   * Update company status
   */
  updateCompany: async (companyId, updates) => {
    const response = await api.patch(`/admin/companies/${companyId}`, updates);
    return response.data;
  },

  /**
   * Delete order
   */
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get all users
   */
  getAllUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },
};

export default adminService;
