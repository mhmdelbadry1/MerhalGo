const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');

/**
 * Register a new customer
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, fullName, phone, phoneCountryCode, whatsapp, whatsappCountryCode, address } = req.body;

    // Check if user already exists (case-insensitive email comparison)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail);
    
    let authUserId;

    if (existingUser) {
      // Check if verified in profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email_verified, role')
        .eq('id', existingUser.id)
        .single();

      logger.info(`Re-registration check for ${email}:`, { 
        profileExists: !!profile, 
        emailVerified: profile?.email_verified, 
        role: profile?.role,
        profileError: profileError?.message
      });

      // Case 1: Profile exists and is unverified customer -> resend code
      if (profile && !profile.email_verified && profile.role === 'customer') {
        logger.info(`Unverified customer re-registering: ${email}. Resending code.`);
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await supabaseAdmin
          .from('profiles')
          .update({
            verification_code: verificationCode,
            verification_code_expires: verificationExpiry.toISOString(),
            full_name: fullName || profile.full_name // Update name if provided
          })
          .eq('id', existingUser.id);
          
        emailService.sendVerificationCode(email, fullName, verificationCode).catch(err => 
          logger.error('Verification email failed:', err.message)
        );

        return sendSuccess(res, {
            user: { 
              email, 
              role: 'customer', 
              emailVerified: false 
            },
            requiresVerification: true 
        }, 'Registration successful. Please verify your email.', 200);
      }

      // Case 2: Profile doesn't exist but auth user does -> create profile and send code
      if (!profile || profileError) {
        logger.info(`Auth user exists but no profile for: ${email}. Creating profile.`);
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

        const { error: createProfileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: existingUser.id,
            email,
            full_name: fullName,
            phone,
            phone_country_code: phoneCountryCode || '+20',
            whatsapp,
            whatsapp_country_code: whatsappCountryCode || '+20',
            role: 'customer',
            email_verified: false,
            verification_code: verificationCode,
            verification_code_expires: verificationExpiry.toISOString()
          });

        if (createProfileError) {
          logger.error('Profile creation for existing auth user failed:', createProfileError.message);
          return sendError(res, 'Failed to create profile', 500);
        }

        emailService.sendVerificationCode(email, fullName, verificationCode).catch(err => 
          logger.error('Verification email failed:', err.message)
        );

        return sendSuccess(res, {
            user: { email, role: 'customer', emailVerified: false },
            requiresVerification: true 
        }, 'Registration successful. Please verify your email.', 201);
      }
      
      // Case 3: Email is verified or different role -> cannot re-register
      return sendError(res, 'Email already registered', 400);
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create auth user (email_confirm: false - we'll handle verification ourselves)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm - we verify manually
      user_metadata: { full_name: fullName, role: 'customer' }
    });

    if (authError) {
      logger.error('Auth user creation failed:', authError.message);
      return sendError(res, authError.message, 400);
    }

    // Create profile with verification fields
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        phone_country_code: phoneCountryCode || '+20',
        whatsapp,
        whatsapp_country_code: whatsappCountryCode || '+20',
        role: 'customer',
        email_verified: false,
        verification_code: verificationCode,
        verification_code_expires: verificationExpiry.toISOString()
      });

    if (profileError) {
      logger.error('Profile creation failed:', profileError.message);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return sendError(res, 'Failed to create user profile', 500);
    }

    // Create customer profile
    await supabaseAdmin
      .from('customer_profiles')
      .insert({
        user_id: authUserId,
        address
      });

    // Send verification email
    emailService.sendVerificationCode(email, fullName, verificationCode).catch(err => 
      logger.error('Verification email failed:', err.message)
    );

    logger.info(`New customer registered (pending verification): ${email}`);

    return sendSuccess(res, {
      user: {
        id: authUserId,
        email: email,
        fullName,
        role: 'customer',
        emailVerified: false
      },
      requiresVerification: true
    }, 'Registration successful. Please verify your email.', 201);

  } catch (error) {
    logger.error('Registration error:', error.message);
    return sendError(res, 'Registration failed', 500);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.warn(`Failed login attempt for ${email}`);
      return sendError(res, 'Invalid email or password', 401);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      logger.error('Profile not found for user:', data.user.id);
      return sendError(res, 'User profile not found', 404);
    }

    // Check email verification for customers
    if (profile.role === 'customer' && !profile.email_verified) {
      return sendError(res, 'يرجى تأكيد بريدك الإلكتروني أولاً', 403);
    }

    // Check if company is approved
    if (profile.role === 'company') {
      const { data: companyProfile } = await supabaseAdmin
        .from('company_profiles')
        .select('is_approved')
        .eq('user_id', profile.id)
        .single();

      if (!companyProfile) {
        logger.error(`Company profile not found for user: ${profile.id}`);
        return sendError(res, 'ملف الشركة غير موجود. يرجى التواصل مع الدعم.', 404);
      }

      if (!companyProfile.is_approved) {
        logger.warn(`Suspended company login attempt: ${email}`);
        return sendError(res, 'تم إيقاف حساب الشركة. يرجى التواصل مع الإدارة.', 403);
      }
    }

    logger.info(`User logged in: ${email}`);

    return sendSuccess(res, {
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        fullName: profile.full_name
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    return sendError(res, 'Login failed', 500);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      logger.warn('Token refresh failed:', error?.message);
      return sendError(res, 'Invalid refresh token', 401);
    }

    return sendSuccess(res, {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    }, 'Token refreshed successfully');

  } catch (error) {
    logger.error('Refresh token error:', error);
    return sendError(res, 'Token refresh failed', 500);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get full profile with related data
    let profileData = { ...req.user.profile };

    if (req.user.role === 'customer') {
      const { data: customerProfile } = await supabaseAdmin
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      profileData.customerProfile = customerProfile;
    } else if (req.user.role === 'company') {
      const { data: companyProfile } = await supabaseAdmin
        .from('company_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      profileData.companyProfile = companyProfile;
    }

    return sendSuccess(res, profileData);

  } catch (error) {
    logger.error('Get current user error:', error);
    return sendError(res, 'Failed to get user data', 500);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // With Supabase, logout is handled client-side
    // This endpoint is mainly for logging purposes
    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    logger.error('Logout error:', error);
    return sendError(res, 'Logout failed', 500);
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      logger.error('Password reset request error:', error);
      // Don't reveal if email exists or not
    }

    // Always return success to prevent email enumeration
    return sendSuccess(res, null, 'If the email exists, a password reset link has been sent');

  } catch (error) {
    logger.error('Forgot password error:', error);
    return sendError(res, 'Request failed', 500);
  }
};

/**
 * Update password
 * POST /api/auth/update-password
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 400);
    }

    // 1. Verify current password by attempting a sign-in (or re-authentication)
    // Note: admin.updateUserById doesn't require old password, so we must check manually.
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: currentPassword
    });

    if (signInError) {
      logger.warn(`Password update failed: Invalid current password for ${email}`);
      return sendError(res, 'كلمة المرور الحالية غير صحيحة', 401); // Localized error
    }

    // 2. Update to new password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      logger.error('Password update error:', error);
      return sendError(res, 'Failed to update password', 500);
    }

    // 3. Sign in with new password to get fresh tokens
    const { data: signInData, error: newSignInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: newPassword
    });

    if (newSignInError || !signInData.session) {
      logger.warn(`Password updated but auto-login failed for ${email}`);
      // Fallback: Client will have to login manually, but password IS changed.
      return sendSuccess(res, null, 'تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مرة أخرى.'); 
    }

    logger.info(`Password updated and session refreshed for user: ${email}`);
    
    // Return new session data
    return sendSuccess(res, {
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        user: signInData.user
      }
    }, 'تم تغيير كلمة المرور بنجاح');

  } catch (error) {
    logger.error('Update password error:', error);
    return sendError(res, 'Failed to update password', 500);
  }
};

/**
 * Update user profile
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, whatsapp, representativeName } = req.body;

    // Prepare updates for the 'profiles' table
    let profileUpdates = {
      phone,
      whatsapp
    };

    // Logic for 'full_name' update:
    // - If Customer: 'name' from form is their Full Name.
    // - If Company: 'representativeName' from form is their Full Name. 'name' is Company Name.
    if (req.user.role === 'customer') {
      if (name) profileUpdates.full_name = name;
    } else if (req.user.role === 'company') {
      if (representativeName) profileUpdates.full_name = representativeName;
      // We do NOT use 'name' here for profiles.full_name because it refers to company_name
    } else {
      // Admin or other: default behavior
      if (name) profileUpdates.full_name = name;
    }

    // Update profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (profileError) {
      logger.error('Profile update error:', profileError);
      return sendError(res, 'Failed to update profile', 500);
    }

    // Update customer_profiles table
    if (req.user.role === 'customer' && address !== undefined) {
      const { error: customerError } = await supabaseAdmin
        .from('customer_profiles')
        .update({ address })
        .eq('user_id', userId);

      if (customerError) {
        logger.error('Customer profile update error:', customerError);
        return sendError(res, 'Failed to update address', 500);
      }
    }

    // Update company_profiles table
    if (req.user.role === 'company') {
      const updates = {};
      if (address !== undefined) updates.main_office_address = address;
      if (name) updates.company_name = name; // Map 'name' form field to company_name

      if (Object.keys(updates).length > 0) {
        const { error: companyError } = await supabaseAdmin
          .from('company_profiles')
          .update(updates)
          .eq('user_id', userId);

        if (companyError) {
           logger.error('Company profile update error:', companyError);
           return sendError(res, 'Failed to update company data', 500);
        }
      }
    }

    // Fetch updated profile
    // We use strict relationship syntax because multiple FKs exist (user_id vs approved_by)
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *, 
        customer_profiles(address),
        company_profiles!company_profiles_user_id_fkey(*)
      `)
      .eq('id', userId)
      .single();

    if (fetchError || !updatedProfile) {
      logger.error('Error fetching updated profile:', fetchError);
      return sendError(res, 'Profile updated but failed to fetch fresh data', 500);
    }

    logger.info(`Profile updated for user: ${userId}`);
    
    // Format response
    const userResponse = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      name: updatedProfile.full_name,
      phone: updatedProfile.phone,
      whatsapp: updatedProfile.whatsapp,
      role: updatedProfile.role,
      address: updatedProfile.customer_profiles?.address, // For customers
      companyProfile: updatedProfile.company_profiles // For companies
    };

    return sendSuccess(res, userResponse, 'Profile updated successfully');

  } catch (error) {
    logger.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
};
/**
 * Verify customer email with code
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Get profile with verification data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('role', 'customer')
      .single();

    if (profileError || !profile) {
      return sendError(res, 'الحساب غير موجود', 404);
    }

    if (profile.email_verified) {
      return sendError(res, 'البريد الإلكتروني محقق مسبقاً', 400);
    }

    // Check if code is expired
    if (new Date() > new Date(profile.verification_code_expires)) {
      return sendError(res, 'رمز التحقق منتهي الصلاحية. يرجى طلب رمز جديد.', 400);
    }

    // Verify code
    if (profile.verification_code !== code) {
      return sendError(res, 'رمز التحقق غير صحيح', 400);
    }

    // Update profile to verified
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        email_verified: true,
        verification_code: null,
        verification_code_expires: null
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Email verification update failed:', updateError);
      return sendError(res, 'فشل التحقق من البريد الإلكتروني', 500);
    }

    logger.info(`Profile email_verified updated to: ${updatedProfile?.email_verified}`);

    // Also confirm email in Supabase Auth - AWAIT and catch errors
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      email_confirm: true
    });

    if (authUpdateError) {
      logger.error('Supabase Auth email confirmation failed:', authUpdateError);
      // Don't fail the request - profile is already updated, auth will catch up
    } else {
      logger.info(`Supabase Auth email confirmed for: ${email}`);
    }

    // Send welcome email now that they're verified
    emailService.sendWelcomeEmail(email, profile.full_name).catch(err => 
      logger.error('Welcome email failed:', err.message)
    );

    logger.info(`Email verified for customer: ${email}`);

    return sendSuccess(res, { verified: true }, 'تم التحقق من البريد الإلكتروني بنجاح! 🎉');

  } catch (error) {
    logger.error('Email verification error:', error);
    return sendError(res, 'فشل التحقق من البريد الإلكتروني', 500);
  }
};

/**
 * Resend verification code
 * POST /api/auth/resend-verification
 */
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('role', 'customer')
      .single();

    if (profileError || !profile) {
      return sendError(res, 'الحساب غير موجود', 404);
    }

    if (profile.email_verified) {
      return sendError(res, 'البريد الإلكتروني محقق مسبقاً', 400);
    }

    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update profile with new code
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        verification_code: verificationCode,
        verification_code_expires: verificationExpiry.toISOString()
      })
      .eq('id', profile.id);

    if (updateError) {
      logger.error('Resend verification code update failed:', updateError);
      return sendError(res, 'فشل إرسال رمز التحقق', 500);
    }

    // Send verification email
    await emailService.sendVerificationCode(email, profile.full_name, verificationCode);

    logger.info(`Verification code resent to: ${email}`);

    return sendSuccess(res, null, 'تم إرسال رمز التحقق الجديد إلى بريدك الإلكتروني');

  } catch (error) {
    logger.error('Resend verification error:', error);
    return sendError(res, 'فشل إرسال رمز التحقق', 500);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser,
  logout,
  forgotPassword,
  updatePassword,
  updateProfile,
  verifyEmail,
  resendVerificationCode
};
