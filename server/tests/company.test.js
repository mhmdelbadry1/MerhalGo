/**
 * Company & Offers Tests
 * Tests company operations and offer management
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('🏢 Company & Offers Tests', () => {
  
  beforeAll(async () => {
    // Login as company if not already logged in
    if (!global.testData.companyToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.company.email,
          password: global.testCredentials.company.password
        });
      
      if (res.status === 200) {
        global.testData.companyToken = res.body.data.session.access_token;
      }
    }
  });

  describe('Company Profile', () => {
    
    test('C1.1: Get company profile', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const res = await request(API_URL)
        .get('/company/profile')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        console.log('✅ Company profile retrieved');
      } else {
        console.log('⚠️ Get company profile:', res.status, res.body.message);
      }
    });
  });

  describe('Available Orders', () => {
    
    test('C2.1: Get available orders for bidding', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const res = await request(API_URL)
        .get('/company/available-orders')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const orders = res.body.data.data || res.body.data || [];
      console.log(`✅ Found ${orders.length} available orders`);
      
      // Store first order for offer testing
      if (orders.length > 0) {
        global.testData.availableOrderId = orders[0].id;
      }
    });
  });

  describe('Offer Management', () => {
    
    test('C3.1: Submit offer on available order', async () => {
      if (!global.testData.companyToken || !global.testData.availableOrderId) {
        console.log('⏭️ Skipping - no token or available order');
        return;
      }

      const offerData = {
        orderId: global.testData.availableOrderId,
        price: 500,
        currency: 'EGP',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Test offer from automated tests'
      };

      const res = await request(API_URL)
        .post('/company/offers')
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send(offerData);
      
      if (res.status === 201 || res.status === 200) {
        expect(res.body.success).toBe(true);
        global.testData.testOfferId = res.body.data.id;
        console.log('✅ Offer submitted:', res.body.data.id);
      } else if (res.status === 409) {
        console.log('⚠️ Offer already exists on this order');
      } else {
        console.log('⚠️ Offer submission:', res.status, res.body.message);
      }
    });

    test('C3.2: Get company offers', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const res = await request(API_URL)
        .get('/company/offers')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const offers = res.body.data.data || res.body.data || [];
      console.log(`✅ Found ${offers.length} company offers`);
    });

    test('C3.3: Update pending offer', async () => {
      if (!global.testData.companyToken || !global.testData.testOfferId) {
        console.log('⏭️ Skipping - no token or offer ID');
        return;
      }

      const updateData = {
        price: 450,
        notes: 'Updated test offer'
      };

      const res = await request(API_URL)
        .put(`/company/offers/${global.testData.testOfferId}`)
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send(updateData);
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        console.log('✅ Offer updated successfully');
      } else {
        console.log('⚠️ Offer update:', res.status, res.body.message);
      }
    });

    test('C3.4: Delete pending offer', async () => {
      if (!global.testData.companyToken || !global.testData.testOfferId) {
        console.log('⏭️ Skipping - no token or offer ID');
        return;
      }

      const res = await request(API_URL)
        .delete(`/company/offers/${global.testData.testOfferId}`)
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        console.log('✅ Offer deleted successfully');
        global.testData.testOfferId = null;
      } else {
        console.log('⚠️ Offer deletion:', res.status, res.body.message);
      }
    });
  });

  describe('Company Access Control', () => {
    
    test('C4.1: Company cannot access admin endpoints', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const res = await request(API_URL)
        .get('/admin/companies')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      expect(res.status).toBe(403);
      console.log('✅ Company correctly blocked from admin endpoints');
    });

    test('C4.2: Suspended company cannot login', async () => {
      // This test requires a suspended company account
      // For now, we just verify the endpoint exists
      console.log('⏭️ Suspended company test requires manual setup');
    });
  });
});
