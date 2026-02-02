/**
 * Test Setup - Initializes test environment
 */
require('dotenv').config();

const { supabaseAdmin } = require('../src/config/supabase');

// Test data storage
global.testData = {
  adminToken: null,
  customerToken: null,
  companyToken: null,
  testOrderId: null,
  testOfferId: null,
};

// Test credentials - use existing test accounts
global.testCredentials = {
  admin: {
    email: 'm7md3022@gmail.com',
    password: process.env.TEST_ADMIN_PASSWORD || '8a43386e'
  },
  customer: {
    email: 'm.55755846@gmail.com',
    password: process.env.TEST_CUSTOMER_PASSWORD || '8a43386e'
  },
  company: {
    email: 'mohamedhassan221012@gmail.com',
    password: process.env.TEST_COMPANY_PASSWORD || '8a43386e'
  }
};

// API base URL
global.API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Helper function for authenticated requests
global.authRequest = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Supabase admin for test cleanup
global.supabaseAdmin = supabaseAdmin;

console.log('🧪 Test environment initialized');
console.log(`📍 API URL: ${global.API_URL}`);
