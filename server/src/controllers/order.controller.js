const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError, getPagination, formatPaginatedResponse } = require('../utils/helpers');
const logger = require('../utils/logger');
const { generateOrderNumber } = require('../utils/generateId');
const { ORDER_STATUS, ORDER_TYPES } = require('../config/constants');
const emailService = require('../services/email.service');

/**
 * Create a new order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const { orderType, formData } = req.body;
    const customerId = req.user.id;

    // Validate order type
    if (!Object.values(ORDER_TYPES).includes(orderType)) {
      return sendError(res, 'Invalid order type', 400);
    }

    // Generate order number
    const orderNumber = generateOrderNumber(orderType);

    // Create order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        order_type: orderType,
        status: ORDER_STATUS.REVIEWING,
        form_data: formData
      })
      .select()
      .single();

    if (error) {
      logger.error('Order creation error:', error);
      return sendError(res, 'Failed to create order', 500);
    }

    // Note: Skipping order count update - can be calculated dynamically from orders table
    // The customer_profiles.total_orders field update is not critical for order creation

    // Send confirmation email
    try {
      await emailService.sendOrderConfirmation(
        req.user.email,
        req.user.profile?.full_name || 'عميل عزيز',
        orderNumber,
        orderType
      );
    } catch (emailError) {
      logger.error('Order confirmation email failed:', emailError);
    }

    // Populate documents table if files exist in formData
    if (formData.files && Array.isArray(formData.files) && formData.files.length > 0) {
      try {
        const documentsData = formData.files.map(file => ({
          entity_type: 'order',
          entity_id: order.id,
          file_name: file.name,
          file_path: file.path,
          file_type: file.type,
          uploaded_by: customerId
        }));
        
        await supabaseAdmin.from('documents').insert(documentsData);
        logger.info(`Inserted ${documentsData.length} documents for order ${orderNumber}`);
      } catch (docError) {
        logger.error('Failed to populate documents table:', docError);
        // Don't fail the request, just log error
      }
    }

    logger.info(`Order created: ${orderNumber} by ${req.user.email}`);

    return sendSuccess(res, order, 'Order created successfully', 201);

  } catch (error) {
    logger.error('Create order error:', error);
    return sendError(res, 'Failed to create order', 500);
  }
};

/**
 * Get customer's orders
 * GET /api/orders
 */
const getOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { page = 1, limit = 10, status, orderType } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    let query = supabaseAdmin
      .from('orders')
      .select('*, offers(count)', { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (orderType) {
      query = query.eq('order_type', orderType);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      logger.error('Get orders error:', error);
      return sendError(res, 'Failed to fetch orders', 500);
    }

    return sendSuccess(res, formatPaginatedResponse(orders, count, page, pageLimit));

  } catch (error) {
    logger.error('Get orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        offers (
          *,
          company:company_id (
            id,
            company_name,
            email,
            phone
          )
        )
      `)
      .eq('id', id)
      .eq('customer_id', customerId)
      .single();

    if (error || !order) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, order);

  } catch (error) {
    logger.error('Get order error:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
};

/**
 * Update order
 * PATCH /api/orders/:id
 */
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;
    const { formData, notes } = req.body;

    // Check if order exists and belongs to customer
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .eq('customer_id', customerId)
      .single();

    if (!existingOrder) {
      return sendError(res, 'Order not found', 404);
    }

    // Only allow updates if order is pending or reviewing
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.REVIEWING].includes(existingOrder.status)) {
      return sendError(res, 'Cannot update order in current status', 400);
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        form_data: formData,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Update order error:', error);
      return sendError(res, 'Failed to update order', 500);
    }

    logger.info(`Order updated: ${order.order_number}`);
    return sendSuccess(res, order, 'Order updated successfully');

  } catch (error) {
    logger.error('Update order error:', error);
    return sendError(res, 'Failed to update order', 500);
  }
};

/**
 * Cancel order
 * DELETE /api/orders/:id
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    // First, get the order to check its current status
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, status, order_number')
      .eq('id', id)
      .eq('customer_id', customerId)
      .single();

    if (fetchError || !existingOrder) {
      return sendError(res, 'الطلب غير موجود', 404);
    }

    // Only allow cancellation if order is in pending, reviewing, or offered status
    const cancellableStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.REVIEWING, ORDER_STATUS.OFFERED];
    if (!cancellableStatuses.includes(existingOrder.status)) {
      return sendError(res, 'لا يمكن إلغاء طلب قيد التنفيذ أو مكتمل', 400);
    }

    // Now cancel the order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: ORDER_STATUS.CANCELLED,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return sendError(res, 'فشل إلغاء الطلب', 500);
    }

    // Also reject any pending offers for this order
    await supabaseAdmin
      .from('offers')
      .update({ status: 'rejected' })
      .eq('order_id', id)
      .eq('status', 'pending');

    logger.info(`Order cancelled: ${order.order_number}`);
    return sendSuccess(res, order, 'تم إلغاء الطلب بنجاح');

  } catch (error) {
    logger.error('Cancel order error:', error);
    return sendError(res, 'فشل إلغاء الطلب', 500);
  }
};

/**
 * Get offers for an order
 * GET /api/orders/:id/offers
 */
const getOrderOffers = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    // Verify order belongs to customer
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('id', id)
      .eq('customer_id', customerId)
      .single();

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Get offers
    const { data: offers, error } = await supabaseAdmin
      .from('offers')
      .select(`
        *,
        company:company_id (
          id,
          full_name,
          email,
          phone,
          company_profiles:company_profiles!company_profiles_user_id_fkey (
            company_name,
            company_name_en,
            logo_url,
            experience_years
          )
        )
      `)
      .eq('order_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Get offers error:', error);
      return sendError(res, 'Failed to fetch offers', 500);
    }

    // Self-healing: Sync total_offers count
    // Use the actual number of fetched offers to update the order's count
    // This fixes any discrepancies caused by previous deletions or bugs
    const actualCount = offers ? offers.length : 0;
    
    // Fire and forget update (don't await to not slow down response)
    // Only update the count - status should be managed by explicit actions (accept/reject/cancel)
    supabaseAdmin
      .from('orders')
      .update({ total_offers: actualCount })
      .eq('id', id)
      .then(({ error: updateError }) => {
        if (updateError) logger.error('Failed to sync offer count:', updateError);
      });

    return sendSuccess(res, offers);

  } catch (error) {
    logger.error('Get offers error:', error);
    return sendError(res, 'Failed to fetch offers', 500);
  }
};

/**
 * Accept an offer
 * POST /api/orders/:id/accept-offer
 */
const acceptOffer = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { offerId } = req.body;
    const customerId = req.user.id;

    // Verify order and offer
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, selected_offer_id')
      .eq('id', orderId)
      .eq('customer_id', customerId)
      .single();

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (order.selected_offer_id) {
      return sendError(res, 'An offer has already been accepted for this order', 400);
    }

    const { data: offer } = await supabaseAdmin
      .from('offers')
      .select('*, company:company_id(email, full_name)')
      .eq('id', offerId)
      .eq('order_id', orderId)
      .single();

    if (!offer) {
      return sendError(res, 'Offer not found', 404);
    }

    // Update order
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({
        selected_offer_id: offerId,
        status: ORDER_STATUS.ACCEPTED,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      logger.error('Accept offer - order update error:', orderError);
      return sendError(res, 'Failed to accept offer', 500);
    }

    // Update offer status
    await supabaseAdmin
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', offerId);

    // Reject other offers
    await supabaseAdmin
      .from('offers')
      .update({ status: 'rejected' })
      .eq('order_id', orderId)
      .neq('id', offerId);

    logger.info(`Offer ${offerId} accepted for order ${order.order_number}`);

    // Send notification to company
    try {
      await emailService.sendEmail(
        offer.company.email,
        'Offer Accepted - MirhalGO',
        `<p>Good news! Your offer has been accepted for order ${order.order_number}</p>`
      );
    } catch (emailError) {
      logger.error('Offer acceptance email failed:', emailError);
    }

    return sendSuccess(res, { order, offer }, 'Offer accepted successfully');

  } catch (error) {
    logger.error('Accept offer error:', error);
    return sendError(res, 'Failed to accept offer', 500);
  }
};

/**
 * Reject an offer for an order with reason
 * POST /api/orders/:id/reject-offer
 */
const rejectOffer = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { offerId, reason } = req.body;
    const customerId = req.user.id;
    
    logger.info(`Rejecting offer attempt - Order: ${orderId}, Offer: ${offerId}, Customer: ${customerId}`);

    // Verify order belongs to customer
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', customerId)
      .single();

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    // Get the offer with company details
    const { data: offer } = await supabaseAdmin
      .from('offers')
      .select('*, company:profiles(email, full_name, company_profiles!user_id(company_name))')
      .eq('id', offerId)
      .eq('order_id', orderId)
      .single();

    if (!offer) {
      return sendError(res, 'Offer not found', 404);
    }

    if (offer.status !== 'pending') {
      return sendError(res, 'This offer has already been processed', 400);
    }

    // Update offer status to rejected with reason
    const { error: offerError } = await supabaseAdmin
      .from('offers')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || null
      })
      .eq('id', offerId);

    if (offerError) {
      logger.error('Reject offer - update error:', offerError);
      return sendError(res, 'Failed to reject offer', 500);
    }

    logger.info(`Offer ${offerId} rejected for order ${order.order_number}. Reason: ${reason || 'No reason provided'}`);

    // Send rejection notification email to company
    try {
      const companyName = offer.company?.company_profiles?.company_name || offer.company?.full_name || 'Company';
      const companyEmail = offer.company?.email;
      
      if (companyEmail) {
        await emailService.sendEmail(
          companyEmail,
          'تم رفض عرضك - مرحال جو',
          `
          <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">تم رفض العرض</h2>
            <p>عزيزي ${companyName}،</p>
            <p>نأسف لإبلاغك بأن العميل قام برفض عرضك المقدم للطلب رقم <strong>${order.order_number}</strong>.</p>
            ${reason ? `
            <div style="background: #f8f9fa; padding: 15px; border-right: 4px solid #e74c3c; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">سبب الرفض:</p>
              <p style="margin: 10px 0 0 0;">${reason}</p>
            </div>
            ` : ''}
            <p>يمكنك تقديم عروض أخرى على طلبات جديدة.</p>
            <p>مع تحيات فريق مرحال جو</p>
          </div>
          `
        );
        logger.info(`Rejection email sent to ${companyEmail}`);
      }
    } catch (emailError) {
      logger.error('Offer rejection email failed:', emailError);
      // Don't fail the request if email fails
    }

    return sendSuccess(res, { offer }, 'Offer rejected successfully');

  } catch (error) {
    logger.error('Reject offer error:', error);
    return sendError(res, 'Failed to reject offer', 500);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  getOrderOffers,
  acceptOffer,
  rejectOffer
};
