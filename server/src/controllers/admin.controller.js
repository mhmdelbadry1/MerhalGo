const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError, getPagination, formatPaginatedResponse, normalizeGmailEmail } = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');
const crypto = require('crypto');

/**
 * Generate a strong random password
 */
const generateStrongPassword = (length = 12) => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '@#$%&*!';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += symbols[crypto.randomInt(symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
};

/**
 * Get company registration requests
 * GET /api/admin/registration-requests
 */
const getRegistrationRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    const { data: requests, error, count } = await supabaseAdmin
      .from('company_registration_requests')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (error) {
      logger.error('Get registration requests error:', error);
      return sendError(res, 'Failed to fetch requests', 500);
    }

    return sendSuccess(res, formatPaginatedResponse(requests, count, page, pageLimit));

  } catch (error) {
    logger.error('Get registration requests error:', error);
    return sendError(res, 'Failed to fetch requests', 500);
  }
};

/**
 * Approve company registration
 * POST /api/admin/approve-company
 */
/**
 * Approve company registration
 * POST /api/admin/approve-company
 */
const approveCompany = async (req, res) => {
  try {
    const { requestId, password } = req.body;
    const adminId = req.user.id;

    // Get registration request
    const { data: request, error: requestError } = await supabaseAdmin
      .from('company_registration_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return sendError(res, 'Registration request not found', 404);
    }

    if (request.status !== 'pending') {
      return sendError(res, 'Request has already been processed', 400);
    }

    const formData = request.form_data;
    const email = request.email;
    const normalizedEmail = normalizeGmailEmail(email);
    let authUserId;
    let finalPassword = password; // Track the password used for email
    logger.info(`approveCompany: initial password from req.body exists: ${!!password}`);

    // Check if user already exists using Gmail normalization
    // This ensures we find accounts like m.30223824@gmail.com when approving m30223824@gmail.com
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role');

    const existingProfile = profiles?.find(p => normalizeGmailEmail(p.email) === normalizedEmail);

    if (existingProfile) {
      logger.info(`User already exists for email ${email} (matches ${existingProfile.email}), checking role compatibility...`);
      authUserId = existingProfile.id;

      // SECURITY: Prevent conversion of admin or company accounts
      if (existingProfile.role === 'admin') {
        logger.error(`Attempt to convert admin account to company blocked: ${email}`);
        return sendError(res, 'لا يمكن تحويل حساب المسؤول إلى شركة. يرجى استخدام بريد إلكتروني مختلف.', 403);
      }

      if (existingProfile.role === 'company') {
        logger.error(`Attempt to re-register existing company blocked: ${email}`);
        return sendError(res, 'هذا البريد الإلكتروني مسجل بالفعل كشركة.', 400);
      }

      // Only allow customer → company conversion
      if (existingProfile.role !== 'customer') {
        logger.error(`Invalid role conversion attempt: ${existingProfile.role} → company for ${email}`);
        return sendError(res, 'نوع الحساب غير متوافق مع التحويل إلى شركة.', 400);
      }

      // Valid: customer → company conversion
      logger.info(`Converting customer account to company: ${email}`);

      let authUpdates = {
        user_metadata: { role: 'company', full_name: formData.companyName }
      };

      // If password provided, update it for existing user
      if (password) {
        authUpdates.password = password;
      }

      // Update user metadata AND password (if provided) in Auth
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, authUpdates);

      if (updateUserError) {
        logger.error('Update existing user auth error:', updateUserError);
        return sendError(res, 'Failed to update user credentials', 500);
      }

      // Update existing profile role to 'company'
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({
          role: 'company',
          full_name: formData.companyName, // Optional: update name preferred by company
          phone: formData.phone || undefined,
          phone_country_code: formData.phoneCountryCode || undefined,
          whatsapp: formData.whatsapp || undefined,
          whatsapp_country_code: formData.whatsappCountryCode || undefined
        })
        .eq('id', authUserId);

      if (updateProfileError) {
        logger.error('Update existing profile error:', updateProfileError);
        return sendError(res, 'Failed to update user profile', 500);
      }

    } else {
      // User doesn't exist (or at least no profile), try to create new user
      // Generate strong password if admin didn't provide one
      if (!finalPassword) {
        finalPassword = generateStrongPassword(12);
        logger.info(`Generated new password for new user: ${email}`);
      }
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: formData.companyName,
          role: 'company'
        }
      });

      if (authError) {
        // Double check if it was really "email_exists" but profile was missing (unlikely edge case)
        if (authError.code === 'email_exists') {
             return sendError(res, 'User exists but profile missing. Please contact support.', 422);
        }
        logger.error('Create company user error:', authError);
        return sendError(res, 'Failed to create company account', 500);
      }
      
      authUserId = authData.user.id;

      // Manually create profile (trigger removed to fix database errors)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUserId,
          email,
          full_name: formData.companyName,
          phone: formData.phone,
          phone_country_code: formData.phoneCountryCode || '+20',
          whatsapp: formData.whatsapp,
          whatsapp_country_code: formData.whatsappCountryCode || '+20',
          role: 'company'
        });

      if (profileError) {
        logger.error('Create company profile error:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(authUserId); // Rollback
        return sendError(res, 'Failed to create company profile', 500);
      }
    }

    // Check if company_profile already exists (to prevent unique constraint error)
    const { data: existingCompanyProfile } = await supabaseAdmin
        .from('company_profiles')
        .select('id')
        .eq('user_id', authUserId)
        .single();

    if (existingCompanyProfile) {
        return sendError(res, 'Company profile already exists for this user', 400);
    }

    // Create company profile
    const { error: companyError } = await supabaseAdmin
      .from('company_profiles')
      .insert({
        user_id: authUserId,
        company_name: formData.companyName,
        company_name_en: formData.companyNameEn,
        commercial_register: formData.commercialRegister,
        tax_number: formData.taxNumber,
        company_type: formData.companyType,
        license_type: formData.licenseType,
        website: formData.website,
        main_office_address: formData.mainOfficeAddress,
        branches: formData.branches || [],
        description: formData.description,
        services: formData.services || [],
        service_countries: formData.serviceCountries || [],
        experience_years: formData.experienceYears,
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: adminId
      });

    if (companyError) {
      logger.error('Create company details error:', companyError);
      // Only rollback user creation if it was a NEW user.
      // If it was existing, we might leave them with 'company' role but no profile? 
      // Safe to just return error for now.
      return sendError(res, 'Failed to create company details', 500);
    }

    // Update registration request
    await supabaseAdmin
      .from('company_registration_requests')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    logger.info(`Company approved: ${email} by admin ${req.user.email}`);

    // Send approval email with the password (auto-generated or admin-provided)
    logger.info(`Sending approval email to ${email}, finalPassword exists: ${!!finalPassword}`);
    try {
      await emailService.sendCompanyApprovalEmail(email, formData.companyName, finalPassword);
    } catch (emailError) {
      logger.error('Company approval email failed:', emailError);
    }

    return sendSuccess(res, {
      userId: authUserId,
      email,
      companyName: formData.companyName
    }, 'Company approved successfully');

  } catch (error) {
    logger.error('Approve company error:', error);
    return sendError(res, 'Failed to approve company', 500);
  }
};

/**
 * Reject company registration
 * POST /api/admin/reject-company
 */
const rejectCompany = async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    const adminId = req.user.id;

    const { data: request, error: requestError } = await supabaseAdmin
      .from('company_registration_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return sendError(res, 'Registration request not found', 404);
    }

    if (request.status !== 'pending') {
      return sendError(res, 'Request has already been processed', 400);
    }

    // Update registration request
    const { error } = await supabaseAdmin
      .from('company_registration_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      logger.error('Reject company error:', error);
      return sendError(res, 'Failed to reject company', 500);
    }

    logger.info(`Company rejected: ${request.email} by admin ${req.user.email}`);

    // Send rejection email
    try {
      await emailService.sendCompanyRejectionEmail(
        request.email,
        request.form_data.companyName,
        reason
      );
    } catch (emailError) {
      logger.error('Company rejection email failed:', emailError);
    }

    return sendSuccess(res, null, 'Company registration rejected');

  } catch (error) {
    logger.error('Reject company error:', error);
    return sendError(res, 'Failed to reject company', 500);
  }
};

/**
 * Get all orders
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, orderType } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customer_id(
          id,
          full_name,
          email,
          phone
        ),
        offers(count)
      `, { count: 'exact' })
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
      logger.error('Get all orders error:', error);
      return sendError(res, 'Failed to fetch orders', 500);
    }

    return sendSuccess(res, formatPaginatedResponse(orders, count, page, pageLimit));

  } catch (error) {
    logger.error('Get all orders error:', error);
    return sendError(res, 'Failed to fetch orders', 500);
  }
};

/**
 * Get all companies
 * GET /api/admin/companies
 */
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 50, isApproved } = req.query;
    const { offset, limit: pageLimit } = getPagination(page, limit);

    let query = supabaseAdmin
      .from('company_profiles')
      .select(`
        *,
        profile:user_id(
          id,
          email,
          full_name,
          created_at
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (isApproved !== undefined) {
      query = query.eq('is_approved', isApproved === 'true');
    }

    const { data: companies, error, count } = await query;

    if (error) {
      logger.error('Get all companies error:', error);
      return sendError(res, 'Failed to fetch companies', 500);
    }

    return sendSuccess(res, formatPaginatedResponse(companies, count, page, pageLimit));

  } catch (error) {
    logger.error('Get all companies error:', error);
    return sendError(res, 'Failed to fetch companies', 500);
  }
};

/**
 * Get platform statistics
 * GET /api/admin/statistics
 */
const getStatistics = async (req, res) => {
  try {
    // Get various counts
    const [
      { count: totalOrders },
      { count: activeOrders },
      { count: completedOrders },
      { count: totalCustomers },
      { count: totalCompanies },
      { count: approvedCompanies },
      { count: pendingRequests },
      { count: totalOffers }
    ] = await Promise.all([
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).in('status', ['reviewing', 'offered', 'accepted', 'in_progress']),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabaseAdmin.from('customer_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('company_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('company_profiles').select('*', { count: 'exact', head: true }).eq('is_approved', true),
      supabaseAdmin.from('company_registration_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('offers').select('*', { count: 'exact', head: true })
    ]);

    // Get recent activity
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, order_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const statistics = {
      orders: {
        total: totalOrders || 0,
        active: activeOrders || 0,
        completed: completedOrders || 0
      },
      users: {
        customers: totalCustomers || 0,
        companies: totalCompanies || 0,
        approvedCompanies: approvedCompanies || 0
      },
      pending: {
        companyRequests: pendingRequests || 0
      },
      offers: {
        total: totalOffers || 0
      },
      recentActivity: recentOrders || []
    };

    return sendSuccess(res, statistics);

  } catch (error) {
    logger.error('Get statistics error:', error);
    return sendError(res, 'Failed to fetch statistics', 500);
  }
};

/**
 * Update company status
 * PATCH /api/admin/companies/:id
 */
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const { data: company, error } = await supabaseAdmin
      .from('company_profiles')
      .update({
        is_approved: isApproved,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      logger.error('Update company error:', error);
      return sendError(res, 'Failed to update company', 500);
    }

    logger.info(`Company ${id} status updated by admin ${req.user.email}`);
    return sendSuccess(res, company, 'Company updated successfully');

  } catch (error) {
    logger.error('Update company error:', error);
    return sendError(res, 'Failed to update company', 500);
  }
};

/**
 * Delete order (soft delete - change status to cancelled)
 * DELETE /api/admin/orders/:id
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return sendError(res, 'Order not found', 404);
    }

    logger.info(`Order ${order.order_number} deleted by admin ${req.user.email}`);
    return sendSuccess(res, null, 'Order deleted successfully');

  } catch (error) {
    logger.error('Delete order error:', error);
    return sendError(res, 'Failed to delete order', 500);
  }
};

module.exports = {
  getRegistrationRequests,
  approveCompany,
  rejectCompany,
  getAllOrders,
  getAllCompanies,
  getStatistics,
  updateCompany,
  deleteOrder
};
