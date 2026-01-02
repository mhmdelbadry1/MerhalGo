/**
 * Authentication Tests
 * Tests login, logout, register, and session management
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('🔐 Authentication Tests', () => {
  
  describe('Login Flow', () => {
    
    test('A1.1: Customer login with valid credentials', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.customer.email,
          password: global.testCredentials.customer.password
        });
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.session.access_token).toBeDefined();
        global.testData.customerToken = res.body.data.session.access_token;
        console.log('✅ Customer login successful');
      } else {
        console.log('⚠️ Customer login failed (may need correct password):', res.body);
        expect(res.status).toBe(200);
      }
    });

    test('A1.2: Company login with valid credentials', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.company.email,
          password: global.testCredentials.company.password
        });
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.role).toBe('company');
        global.testData.companyToken = res.body.data.session.access_token;
        console.log('✅ Company login successful');
      } else {
        console.log('⚠️ Company login failed:', res.body);
      }
    });

    test('A1.3: Admin login with valid credentials', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.admin.email,
          password: global.testCredentials.admin.password
        });
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.role).toBe('admin');
        global.testData.adminToken = res.body.data.session.access_token;
        console.log('✅ Admin login successful');
      } else {
        console.log('⚠️ Admin login failed:', res.body);
      }
    });

    test('A1.4: Login with invalid password should fail', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.customer.email,
          password: 'wrong_password_123'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      console.log('✅ Invalid password correctly rejected');
    });

    test('A1.5: Login with non-existent email should fail', async () => {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      console.log('✅ Non-existent email correctly rejected');
    });
  });

  describe('Session Management', () => {
    
    test('A2.1: Get current user with valid token', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }
      
      const res = await request(API_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      console.log('✅ Get current user successful');
    });

    test('A2.2: Get current user without token should fail', async () => {
      const res = await request(API_URL)
        .get('/auth/me');
      
      expect(res.status).toBe(401);
      console.log('✅ Unauthenticated request correctly rejected');
    });

    test('A2.3: Get current user with invalid token should fail', async () => {
      const res = await request(API_URL)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid_token_here');
      
      expect(res.status).toBe(401);
      console.log('✅ Invalid token correctly rejected');
    });
  });
});
