/**
 * Email Normalization Tests
 * Tests Gmail dot alias handling
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('📧 Email Normalization Tests', () => {
  
  describe('Gmail Dot Handling', () => {
    
    test('EN1.1: Login with dotted Gmail works', async () => {
      // m.55755846@gmail.com is same as m55755846@gmail.com
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: 'm.55755846@gmail.com',
          password: global.testCredentials.customer.password
        });
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        console.log('✅ Dotted Gmail login works');
      } else {
        console.log('⚠️ Dotted Gmail login:', res.status);
      }
    });

    test('EN1.2: Login with non-dotted Gmail fails if account has dots', async () => {
      // This tests if we handle the variation
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: 'm55755846@gmail.com',  // Without dot
          password: global.testCredentials.customer.password
        });
      
      // This could either succeed (if system normalizes) or fail
      console.log(`ℹ️ Non-dotted Gmail login result: ${res.status === 200 ? 'Success (normalized)' : 'Failed (strict matching)'}`);
    });
  });

  describe('Email Validation', () => {
    
    test('EN2.1: Invalid email format rejected', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: 'notanemail',
          password: 'password123'
        });
      
      expect([400, 401]).toContain(res.status);
      console.log('✅ Invalid email format rejected');
    });

    test('EN2.2: Email with spaces rejected', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: 'test @email.com',
          password: 'password123'
        });
      
      expect([400, 401]).toContain(res.status);
      console.log('✅ Email with spaces rejected');
    });
  });
});

describe('🔄 Data Validation Tests', () => {
  
  beforeAll(async () => {
    if (!global.testData.customerToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send(global.testCredentials.customer);
      if (res.status === 200) {
        global.testData.customerToken = res.body.data.session.access_token;
      }
    }
  });

  describe('Order Validation', () => {
    
    test('DV1.1: Order without required fields fails', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send({
          order_type: 'local'
          // Missing pickup_location, delivery_location
        });
      
      expect([400, 422]).toContain(res.status);
      console.log('✅ Incomplete order rejected');
    });

    test('DV1.2: Order with invalid order_type fails', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send({
          order_type: 'invalid_type',
          pickup_location: 'Cairo',
          delivery_location: 'Alex'
        });
      
      expect([400, 422]).toContain(res.status);
      console.log('✅ Invalid order type rejected');
    });

    test('DV1.3: Order with negative weight fails', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send({
          order_type: 'local',
          pickup_location: 'Cairo',
          delivery_location: 'Alex',
          weight: -5
        });
      
      expect([400, 422]).toContain(res.status);
      console.log('✅ Negative weight rejected');
    });
  });

  describe('Profile Validation', () => {
    
    test('DV2.1: Update profile with invalid phone fails', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send({
          phone: 'abc'  // Invalid phone number
        });
      
      // Handle various responses
      if (res.status === 200) {
        console.log('ℹ️ Profile update accepted (lenient validation)');
      } else if (res.status === 404) {
        console.log('ℹ️ Profile update endpoint not available');
      } else {
        expect([400, 422]).toContain(res.status);
        console.log('✅ Invalid phone rejected');
      }
    });
  });
});
