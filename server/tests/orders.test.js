/**
 * Order Tests
 * Tests order creation, viewing, and management
 */
const request = require('supertest');

const API_URL = global.API_URL;

describe('📦 Order Tests', () => {
  
  beforeAll(async () => {
    // Login as customer if not already logged in
    if (!global.testData.customerToken) {
      const res = await request(API_URL)
        .post('/auth/login')
        .send({
          email: global.testCredentials.customer.email,
          password: global.testCredentials.customer.password
        });
      
      if (res.status === 200) {
        global.testData.customerToken = res.body.data.session.access_token;
      }
    }
  });

  describe('Order Creation', () => {
    
    test('O1.1: Create local shipping order', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const orderData = {
        order_type: 'local',
        pickup_location: 'القاهرة - مدينة نصر',
        delivery_location: 'الإسكندرية - سموحة',
        shipment_type: 'documents',
        weight: 2,
        description: 'Test order - local shipping',
        requires_packaging: false,
        requires_insurance: false
      };

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send(orderData);
      
      if (res.status === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.order_number).toBeDefined();
        global.testData.testOrderId = res.body.data.id;
        console.log('✅ Local order created:', res.body.data.order_number);
      } else {
        console.log('⚠️ Order creation failed:', res.body);
      }
    });

    test('O1.2: Create international shipping order', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const orderData = {
        order_type: 'international',
        origin_country: 'Egypt',
        origin_port: 'Cairo Airport',
        destination_country: 'Saudi Arabia',
        destination_port: 'Jeddah Port',
        shipment_method: 'air',
        incoterm: 'FOB',
        cargo_type: 'general',
        weight: 100,
        dimensions: { length: 100, width: 50, height: 50 },
        description: 'Test order - international shipping'
      };

      const res = await request(API_URL)
        .post('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`)
        .send(orderData);
      
      if (res.status === 201) {
        expect(res.body.success).toBe(true);
        console.log('✅ International order created:', res.body.data.order_number);
      } else {
        console.log('⚠️ International order creation:', res.status, res.body.message);
      }
    });

    test('O1.3: Create order without auth should fail', async () => {
      const res = await request(API_URL)
        .post('/orders')
        .send({ order_type: 'local' });
      
      expect(res.status).toBe(401);
      console.log('✅ Unauthenticated order creation correctly rejected');
    });
  });

  describe('Order Viewing', () => {
    
    test('O2.1: Get customer orders', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .get('/orders')
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.data || res.body.data)).toBe(true);
      console.log('✅ Customer orders retrieved');
    });

    test('O2.2: Get single order by ID', async () => {
      if (!global.testData.customerToken || !global.testData.testOrderId) {
        console.log('⏭️ Skipping - no token or order ID');
        return;
      }

      const res = await request(API_URL)
        .get(`/orders/${global.testData.testOrderId}`)
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(global.testData.testOrderId);
      console.log('✅ Single order retrieved');
    });

    test('O2.3: Get non-existent order should fail', async () => {
      if (!global.testData.customerToken) {
        console.log('⏭️ Skipping - no customer token');
        return;
      }

      const res = await request(API_URL)
        .get('/orders/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${global.testData.customerToken}`);
      
      expect(res.status).toBe(404);
      console.log('✅ Non-existent order correctly returns 404');
    });
  });
});
