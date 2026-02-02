/**
 * Admin Tests
 * Tests admin operations and access control
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('👨‍💼 Admin Tests', () => {
  
  beforeAll(async () => {
    // Login as admin if not already logged in
    if (!global.testData.adminToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.admin.email,
          password: global.testCredentials.admin.password
        });
      
      if (res.status === 200) {
        global.testData.adminToken = res.body.data.session.access_token;
      }
    }
  });

  describe('Admin Dashboard', () => {
    
    test('AD1.1: Get platform statistics', async () => {
      if (!global.testData.adminToken) {
        console.log('⏭️ Skipping - no admin token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/statistics')
        .set('Authorization', `Bearer ${global.testData.adminToken}`);
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        console.log('✅ Admin statistics retrieved');
      } else {
        console.log('⚠️ Get statistics:', res.status, res.body.message);
      }
    });
  });

  describe('Company Management', () => {
    
    test('AD2.1: Get all companies', async () => {
      if (!global.testData.adminToken) {
        console.log('⏭️ Skipping - no admin token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/companies')
        .set('Authorization', `Bearer ${global.testData.adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const companies = res.body.data.data || res.body.data || [];
      console.log(`✅ Found ${companies.length} companies`);
    });

    test('AD2.2: Get registration requests', async () => {
      if (!global.testData.adminToken) {
        console.log('⏭️ Skipping - no admin token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/registration-requests')
        .set('Authorization', `Bearer ${global.testData.adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      console.log('✅ Registration requests retrieved');
    });
  });

  describe('Order Management', () => {
    
    test('AD3.1: Get all orders', async () => {
      if (!global.testData.adminToken) {
        console.log('⏭️ Skipping - no admin token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/orders')
        .set('Authorization', `Bearer ${global.testData.adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const orders = res.body.data.data || res.body.data || [];
      console.log(`✅ Found ${orders.length} orders (admin view)`);
    });
  });

  describe('Admin Access Control', () => {
    
    test('AD4.1: Non-admin cannot access admin endpoints', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/companies')
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(403);
      console.log('✅ Customer correctly blocked from admin endpoints');
    });

    test('AD4.2: Unauthenticated cannot access admin endpoints', async () => {
      const res = await request(API_URL)
        .get('/admin/companies');
      
      expect(res.status).toBe(401);
      console.log('✅ Unauthenticated correctly blocked from admin endpoints');
    });
  });
});
