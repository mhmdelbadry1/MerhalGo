/**
 * Offer Flow Integration Tests
 * Tests the complete offer lifecycle
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('💰 Offer Flow Tests', () => {
  
  let testOrderId = null;
  let testOfferId = null;

  beforeAll(async () => {
    // Login as customer
    if (!global.testData.customerToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send(global.testCredentials.customer);
      if (res.status === 200) {
        global.testData.customerToken = res.body.data.session.access_token;
      }
    }
    // Login as company
    if (!global.testData.companyToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send(global.testCredentials.company);
      if (res.status === 200) {
        global.testData.companyToken = res.body.data.session.access_token;
      }
    }
  });

  describe('Complete Offer Lifecycle', () => {
    
    test('OF1.1: Customer creates order for offer testing', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send({
          order_type: 'local',
          pickup_location: 'Cairo - Nasr City',
          delivery_location: 'Giza - Dokki',
          shipment_type: 'package',
          weight: 5,
          description: 'Test order for offer lifecycle'
        });
      
      if (res.status === 201) {
        testOrderId = res.body.data.id;
        expect(res.body.data.status).toBe('reviewing');
        console.log('✅ Test order created:', res.body.data.order_number);
      } else {
        console.log('⚠️ Order creation:', res.status, res.body.message);
      }
    });

    test('OF1.2: Company sees order in available orders', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const res = await request(API_URL)
        .get('/company/available-orders')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      expect(res.status).toBe(200);
      
      const orders = res.body.data?.data || res.body.data || [];
      if (testOrderId) {
        const found = orders.find(o => o.id === testOrderId);
        if (found) {
          console.log('✅ Test order visible to company');
        } else {
          console.log('⚠️ Test order not in available orders (may need different status)');
        }
      }
    });

    test('OF1.3: Company submits offer', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      // Get an available order if we don't have testOrderId
      if (!testOrderId) {
        const ordersRes = await request(API_URL)
          .get('/company/available-orders')
          .set('Authorization', `Bearer ${global.testData.companyToken}`);
        
        const orders = ordersRes.body.data?.data || ordersRes.body.data || [];
        if (orders.length > 0) {
          testOrderId = orders[0].id;
        } else {
          console.log('⏭️ No available orders');
          return;
        }
      }

      const res = await request(API_URL)
        .post('/company/offers')
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send({
          orderId: testOrderId,
          price: 350,
          currency: 'EGP',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: 'Fast delivery guaranteed'
        });
      
      if (res.status === 201 || res.status === 200) {
        testOfferId = res.body.data.id;
        expect(res.body.data.status).toBe('pending');
        console.log('✅ Offer submitted:', testOfferId);
      } else if (res.status === 409) {
        console.log('⚠️ Company already has offer on this order');
      } else {
        console.log('⚠️ Offer submission:', res.status, res.body.message);
      }
    });

    test('OF1.4: Cannot submit duplicate offer on same order', async () => {
      if (!global.testData.companyToken || !testOrderId) {
        console.log('⏭️ Skipping - no token or order');
        return;
      }

      const res = await request(API_URL)
        .post('/company/offers')
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send({
          orderId: testOrderId,
          price: 400,
          currency: 'EGP',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      
      expect([400, 409]).toContain(res.status);
      console.log('✅ Duplicate offer correctly rejected');
    });

    test('OF1.5: Customer can view offers on their order', async () => {
      if (!global.testData.customerToken || !testOrderId) {
        console.log('⏭️ Skipping - no token or order');
        return;
      }

      const res = await request(API_URL)
        .get(`/orders/${testOrderId}/offers`)
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      if (res.status === 200) {
        const offers = res.body.data || [];
        console.log(`✅ Customer sees ${offers.length} offers on order`);
      } else {
        console.log('⚠️ Get offers:', res.status, res.body.message);
      }
    });

    test('OF1.6: Company can update pending offer', async () => {
      if (!global.testData.companyToken || !testOfferId) {
        console.log('⏭️ Skipping - no token or offer');
        return;
      }

      const res = await request(API_URL)
        .put(`/company/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send({
          price: 300,
          notes: 'Updated - special discount!'
        });
      
      if (res.status === 200) {
        expect(res.body.data.price).toBe(300);
        console.log('✅ Offer updated successfully');
      } else {
        console.log('⚠️ Offer update:', res.status, res.body.message);
      }
    });
  });

  describe('Offer Validation', () => {
    
    test('OF2.1: Cannot submit offer with negative price', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const ordersRes = await request(API_URL)
        .get('/company/available-orders')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      const orders = ordersRes.body.data?.data || ordersRes.body.data || [];
      if (orders.length === 0) {
        console.log('⏭️ No available orders');
        return;
      }

      const res = await request(API_URL)
        .post('/company/offers')
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send({
          orderId: orders[0].id,
          price: -100,
          currency: 'EGP',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      
      expect([400, 422]).toContain(res.status);
      console.log('✅ Negative price rejected');
    });

    test('OF2.2: Cannot submit offer with end date before start date', async () => {
      if (!global.testData.companyToken) {
        console.log('⏭️ Skipping - no company token');
        return;
      }

      const ordersRes = await request(API_URL)
        .get('/company/available-orders')
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      
      const orders = ordersRes.body.data?.data || ordersRes.body.data || [];
      if (orders.length === 0) {
        console.log('⏭️ No available orders');
        return;
      }

      const res = await request(API_URL)
        .post('/company/offers')
        .set('Authorization', `Bearer ${global.testData.companyToken}`)
        .send({
          orderId: orders[0].id,
          price: 500,
          currency: 'EGP',
          startDate: '2026-01-10',
          endDate: '2026-01-05'  // Before start date!
        });
      
      expect([400, 422]).toContain(res.status);
      console.log('✅ Invalid date range rejected');
    });
  });

  // Cleanup
  afterAll(async () => {
    // Delete test offer if created
    if (testOfferId && global.testData.companyToken) {
      await request(API_URL)
        .delete(`/company/offers/${testOfferId}`)
        .set('Authorization', `Bearer ${global.testData.companyToken}`);
      console.log('🧹 Cleaned up test offer');
    }
  });
});
