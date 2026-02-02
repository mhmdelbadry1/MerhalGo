import api from './api';

const storageService = {
  /**
   * Upload order document
   * @param {File} file 
   * @returns {Promise<{path: string, url: string, filename: string}>}
   */
  uploadOrderDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Order docs usually require auth, handled by api interceptor adding token
    const response = await api.post('/upload/order-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Upload company registration document
   * @param {File} file 
   * @returns {Promise<{path: string, url: string, filename: string}>}
   */
  uploadCompanyDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Public endpoint for registration
    const response = await api.post('/upload/company-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Upload company logo
   * @param {File} file 
   * @returns {Promise<{path: string, url: string, filename: string}>}
   */
  uploadCompanyLogo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/company-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Get file URL
   */
  getFileUrl: async (bucket, path) => {
    // Encoded to safely handle slashes in file path
    const response = await api.get(`/upload/file?bucket=${bucket}&path=${encodeURIComponent(path)}`);
    return response.data.data.url;
  }
};

export default storageService;
