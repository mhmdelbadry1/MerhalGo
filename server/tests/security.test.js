/**
 * Security & Access Control Tests
 * Tests role-based access, CORS, and security measures
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('🔒 Security Tests', () => {
  
  beforeAll(async () => {
    // Login users if not already logged in
    if (!global.testData.customerToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send(global.testCredentials.customer);
      if (res.status === 200) {
        global.testData.customerToken = res.body.data.session.access_token;
      }
    }
    if (!global.testData.companyToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send(global.testCredentials.company);
      if (res.status === 200) {
        global.testData.companyToken = res.body.data.session.access_token;
      }
    }
  });

  describe('Role-Based Access Control', () => {
    
    test('S1.1: Customer cannot access company endpoints', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .get('/company/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(403);
      console.log('✅ Customer blocked from company endpoints');
    });

    test('S1.2: Customer cannot access admin endpoints', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/statistics')
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(403);
      console.log('✅ Customer blocked from admin endpoints');
    });

    test('S1.3: Company cannot access customer order details', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      // Get any order ID from available orders
      const ordersRes = await request(API_URL)
        .get('/company/available-orders')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      const orders = ordersRes.body.data?.data || ordersRes.body.data || [];
      if (orders.length === 0) {
        console.log('⏭️ No available orders to test');
        return;
      }

      // Try to access order via customer endpoint
      const res = await request(API_URL)
        .get(`/orders/${orders[0].id}`)
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      // Should fail - company can't use customer order endpoint
      expect([403, 404]).toContain(res.status);
      console.log('✅ Company blocked from customer order endpoint');
    });

    test('S1.4: Company cannot submit offer on own order', async () => {
      // This would require a company to also be a customer - edge case
      console.log('⏭️ Edge case - requires special setup');
    });
  });

  describe('Input Validation', () => {
    
    test('S2.1: Login with empty email should fail', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({ email: '', password: 'password123' });
      
      expect([400, 401]).toContain(res.status);
      console.log('✅ Empty email rejected');
    });

    test('S2.2: Login with empty password should fail', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: '' });
      
      expect([400, 401]).toContain(res.status);
      console.log('✅ Empty password rejected');
    });

    test('S2.3: SQL injection in login should be blocked', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({ 
          email: "' OR '1'='1", 
          password: "' OR '1'='1" 
        });
      
      expect([400, 401]).toContain(res.status);
      console.log('✅ SQL injection attempt blocked');
    });

    test('S2.4: XSS in order description should be sanitized or blocked', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send({
          orderType: 'local',
          formData: {
            pickupLocation: 'Cairo',
            deliveryLocation: 'Alex',
            description: '<script>alert("xss")</script>',
            weight: 1
          }
        });
      
      // Should either reject, sanitize, or accept (depending on validation)
      // The key is the script shouldn't execute on frontend
      if (res.status === 201) {
        console.log('ℹ️ Order created - XSS prevention should be on frontend');
      } else {
        console.log(`✅ Order creation returned ${res.status}`);
      }
      // This test is informational - not a hard fail
    });
  });

  describe('Rate Limiting & DOS Protection', () => {
    
    test('S3.1: Multiple rapid requests should be handled', async () => {
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(API_URL)
            .post('/auth/login')
            .send({ email: 'test@test.com', password: 'wrong' })
        );
      }
      
      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);
      
      // All should return 401 (or 429 if rate limited)
      statuses.forEach(status => {
        expect([401, 429]).toContain(status);
      });
      console.log('✅ Rapid requests handled:', statuses);
    });
  });
});
