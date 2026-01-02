const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError, getPagination, formatPaginatedResponse, normalizeGmailEmail } = require('../utils/helpers');
const logger = require('../utils/logger');
const { ORDER_STATUS, OFFER_STATUS, OFFER_EXPIRY_HOURS } = require('../config/constants');
const emailService = require('../services/email.service');

/**
 * Submit company registration request
 * POST /api/company/register
 */
const submitRegistration = async (req, res) => {
  try {
    const { email, formData } = req.body;
    const normalizedEmail = normalizeGmailEmail(email);

    // Check if email already exists in profiles table (with Gmail normalization)
    // For Gmail addresses, foo.bar@gmail.com = foobar@gmail.com
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role');

    const existingProfile = profiles?.find(p => normalizeGmailEmail(p.email) === normalizedEmail);

    if (existingProfile) {
      // Only BLOCK if the account is already a company or admin
      // ALLOW customers to submit upgrade requests
      if (existingProfile.role === 'company') {
        logger.warn(`Company registration blocked: already a company - ${email} matches ${existingProfile.email}`);
        return sendError(res, 'هذا البريد الإلكتروني مسجل بالفعل كشركة.', 409);
      }
      if (existingProfile.role === 'admin') {
        logger.warn(`Company registration blocked: admin account - ${email} matches ${existingProfile.email}`);
        return sendError(res, 'لا يمكن تحويل حساب المسؤول إلى شركة.', 409);
      }
      // Customer account - this is an UPGRADE request, allow it!
      logger.info(`Customer account found for ${email}, allowing company upgrade request`);
    }

    // SECURITY: Check if there's already a pending request with this email (with Gmail normalization)
    const { data: requests } = await supabaseAdmin
      .from('company_registration_requests')
      .select('id, email, status')
      .eq('status', 'pending');

    const existingRequest = requests?.find(r => normalizeGmailEmail(r.email) === normalizedEmail);

    if (existingRequest) {
      logger.warn(`Company registration blocked: pending request exists - ${email} matches ${existingRequest.email}`);
      return sendError(res, 'يوجد طلب تسجيل قيد المراجعة بنفس البريد الإلكتروني.', 409);
    }

    // Create registration request (store original email, not normalized)
    const { data: request, error } = await supabaseAdmin
      .from('company_registration_requests')
      .insert({
        email,
        form_data: formData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      logger.error('Company registration error:', error);
      return sendError(res, 'فشل تسجيل الطلب', 500);
    }

    logger.info(`Company registration submitted: ${email}`);
    return sendSuccess(res, request, 'تم تقديم طلب التسجيل بنجاح', 201);

  } catch (error) {
    logger.error('Submit registration error:', error);
    return sendError(res, 'فشل في تسجيل الشركة', 500);
  }
};

/**
 * Get company profile
 * GET /api/company/profile
 */
const getProfile = async (req, res) => {
  try {
    const companyId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('company_profiles')
      .select('*')
      .eq('user_id', companyId)
      .single();

    if (error || !profile) {
      return sendError(res, 'Company profile not found', 404);
    }

    return sendSuccess(res, profile);

  } catch (error) {
    logger.error('Get company profile error:', error);
    return sendError(res, 'Failed to fetch profile', 500);
  }
};

/**
 * Update company profile
 * PATCH /api/company/profile
 */
const updateProfile = async (req, res) => {
  try {
    const companyId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated this way
    delete updates.is_approved;
    delete updates.approved_at;
    delete updates.approved_by;
    delete updates.user_id;

    const { data: profile, error } = await supabaseAdmin
      .from('company_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', companyId)
      .select()
      .single();

    if (error) {
      logger.error('Update company profile error:', error);
      return sendError(res, 'Failed to update profile', 500);
    }

    logger.info(`Company profile updated: ${req.user.email}`);
    return sendSuccess(res, profile, 'Profile updated successfully');

  } catch (error) {
    logger.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
};

/**
 * Get available orders for bidding
 * GET /api/company/available-orders
 */
const getAvailableOrders = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { page = 1, limit = 20, orderType } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Get orders that are in reviewing or offered status
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customer_id(
          id,
          full_name,
          email
        ),
        offers!left(count)
      `, { count: 'exact' })
      .in('status', [ORDER_STATUS.REVIEWING, ORDER_STATUS.OFFERED])
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (orderType) {
      query = query.eq('order_type', orderType);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      logger.error('Get available orders error:', error);
      return sendError(res, 'Failed to fetch orders', 500);
    }

    // Check which orders this company has already bid on
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: existingOffers } = await supabaseAdmin
        .from('offers')
        .select('order_id')
        .eq('company_id', companyId)
        .in('order_id', orderIds);

      const offeredOrderIds = new Set(existingOffers?.map(o => o.order_id) || []);
      
      // Add flag to indicate if company has already offered
      orders.forEach(order => {
        order.has_offered = offeredOrderIds.has(order.id);
      });
    }

    return sendSuccess(res, formatPaginatedResponse(orders, count, page, pageLimit));

  } catch (error) {
    logger.error('Get available orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

/**
 * Submit offer for an order
 * POST /api/company/offers
 */
const submitOffer = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { orderId, price, currency, startDate, endDate, notes } = req.body;

    // Check if order exists and is available for offers
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, customer:customer_id(email, full_name)')
      .eq('id', orderId)
      .single();

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (![ORDER_STATUS.REVIEWING, ORDER_STATUS.OFFERED].includes(order.status)) {
      return sendError(res, 'This order is no longer available for offers', 400);
    }

    // Check if company already submitted an offer
    const { data: existingOffer } = await supabaseAdmin
      .from('offers')
      .select('id')
      .eq('order_id', orderId)
      .eq('company_id', companyId)
      .single();

    if (existingOffer) {
      return sendError(res, 'You have already submitted an offer for this order', 400);
    }

    // Calculate estimated days from dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const estimatedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Create offer
    // Note: Database needs columns: service_type, start_date, end_date
    const { data: offer, error } = await supabaseAdmin
      .from('offers')
      .insert({
        order_id: orderId,
        company_id: companyId,
        price,
        currency: currency || 'EGP',
        estimated_days: estimatedDays > 0 ? estimatedDays : null,
        start_date: startDate,
        end_date: endDate,
        notes,
        status: OFFER_STATUS.PENDING
      })
      .select()
      .single();

    if (error) {
      logger.error('Submit offer error:', error);
      return sendError(res, 'Failed to submit offer', 500);
    }

    // Update order status to offered if it was reviewing
    if (order.status === ORDER_STATUS.REVIEWING) {
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: ORDER_STATUS.OFFERED,
          total_offers: (order.total_offers || 0) + 1
        })
        .eq('id', orderId);
    } else {
      // Just increment offer count
      await supabaseAdmin
        .from('orders')
        .update({ total_offers: (order.total_offers || 0) + 1 })
        .eq('id', orderId);
    }

    logger.info(`Offer submitted: ${offer.id} for order ${order.order_number}`);

    // Send notification to customer
    try {
      const { data: companyProfile } = await supabaseAdmin
        .from('company_profiles')
        .select('company_name')
        .eq('user_id', companyId)
        .single();

      await emailService.sendOfferReceivedNotification(
        order.customer.email,
        order.customer.full_name,
        order.order_number,
        companyProfile?.company_name || 'A shipping company',
        price,
        currency
      );
    } catch (emailError) {
      logger.error('Offer notification email failed:', emailError);
    }

    return sendSuccess(res, offer, 'Offer submitted successfully', 201);

  } catch (error) {
    logger.error('Submit offer error:', error);
    return sendError(res, 'Failed to submit offer', 500);
  }
};

/**
 * Get company's offers
 * GET /api/company/offers
 */
const getOffers = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    let query = supabaseAdmin
      .from('offers')
      .select(`
        *,
        order:order_id(
          id,
          order_number,
          order_type,
          status,
          customer:customer_id(
            id,
            full_name,
            email
          )
        )
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: offers, error, count } = await query;

    if (error) {
      logger.error('Get offers error:', error);
      return sendError(res, 'Failed to fetch offers', 500);
    }

    return sendSuccess(res, formatPaginatedResponse(offers, count, page, pageLimit));

  } catch (error) {
    logger.error('Get offers error:', error);
    return sendError(res, 'Failed to fetch offers', 500);
  }
};

/**
 * Update offer
 * PATCH /api/company/offers/:id
 */
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    const { price, currency, startDate, endDate, notes } = req.body;

    // Check if offer exists and belongs to company
    const { data: existingOffer } = await supabaseAdmin
      .from('offers')
      .select('status')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!existingOffer) {
      return sendError(res, 'العرض غير موجود', 404);
    }

    if (existingOffer.status !== OFFER_STATUS.PENDING) {
      return sendError(res, 'لا يمكن تعديل العرض في حالته الحالية', 400);
    }

    // Build update object with only provided fields
    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (currency !== undefined) updateData.currency = currency;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (notes !== undefined) updateData.notes = notes;
    
    // Calculate estimated days if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const estimatedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      updateData.estimated_days = estimatedDays > 0 ? estimatedDays : null;
    }

    const { data: offer, error } = await supabaseAdmin
      .from('offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Update offer error:', error);
      return sendError(res, 'فشل تحديث العرض', 500);
    }

    logger.info(`Offer updated: ${id}`);
    return sendSuccess(res, offer, 'تم تحديث العرض بنجاح');

  } catch (error) {
    logger.error('Update offer error:', error);
    return sendError(res, 'فشل تحديث العرض', 500);
  }
};

/**
 * Get company's accepted orders
 * GET /api/company/orders
 */
const getCompanyOrders = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    // Get accepted offers
    const { data: offers, error, count } = await supabaseAdmin
      .from('offers')
      .select(`
        *,
        order:order_id(
          *,
          customer:customer_id(
            id,
            full_name,
            email,
            phone
          )
        )
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .eq('status', OFFER_STATUS.ACCEPTED)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (error) {
      logger.error('Get company orders error:', error);
      return sendError(res, 'Failed to fetch orders', 500);
    }

    return sendSuccess(res, formatPaginatedResponse(offers, count, page, pageLimit));

  } catch (error) {
    logger.error('Get company orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

/**
 * Delete/withdraw an offer
 * DELETE /api/company/offers/:id
 */
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    // Check if offer exists and belongs to company
    const { data: existingOffer } = await supabaseAdmin
      .from('offers')
      .select('status, order_id')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!existingOffer) {
      return sendError(res, 'العرض غير موجود', 404);
    }

    if (existingOffer.status !== OFFER_STATUS.PENDING) {
      return sendError(res, 'لا يمكن حذف العرض في حالته الحالية', 400);
    }

    // Delete the offer (include company_id for extra safety)
    const { error, count } = await supabaseAdmin
      .from('offers')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) {
      logger.error('Delete offer error:', { error, offerId: id, companyId });
      return sendError(res, 'فشل حذف العرض', 500);
    }
    
    if (count === 0) {
        logger.warn(`Delete offer failed: No rows deleted`, { 
          offerId: id, 
          companyId,
          existingOfferStatus: existingOffer.status 
        });
        return sendError(res, 'لم يتم العثور على العرض لحذفه', 404);
    }
    
    logger.info(`Offer deleted successfully: ${id} (Rows: ${count})`);

    // Decrement the order's offer count and update status if needed
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('total_offers, status')
      .eq('id', existingOffer.order_id)
      .single();

    if (order) {
      const newOffersCount = Math.max(0, (order.total_offers || 1) - 1);
      const updateData = { total_offers: newOffersCount };
      
      // If no more offers, reset status from 'offered' back to 'reviewing'
      if (newOffersCount === 0 && order.status === 'offered') {
        updateData.status = 'reviewing';
      }
      
      await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', existingOffer.order_id);
    }

    logger.info(`Offer deleted: ${id}`);
    return sendSuccess(res, null, 'تم حذف العرض بنجاح');

  } catch (error) {
    logger.error('Delete offer error:', error);
    return sendError(res, 'فشل حذف العرض', 500);
  }
};

module.exports = {
  submitRegistration,
  getProfile,
  updateProfile,
  getAvailableOrders,
  submitOffer,
  getOffers,
  updateOffer,
  deleteOffer,
  getCompanyOrders
};
