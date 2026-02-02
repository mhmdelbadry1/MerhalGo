const { supabaseAdmin } = require('../config/supabase');
const { sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Authentication middleware - Verifies JWT token from Supabase
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token attempt', { error: error?.message });
      return sendError(res, 'Invalid or expired token', 401);
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      logger.error('User profile not found', { 
        userId: user.id, 
        email: user.email,
        profileError: profileError?.message,
        profileErrorCode: profileError?.code
      });
      return sendError(res, 'User profile not found', 404);
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      profile: profile
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return sendError(res, 'Authentication failed', 500);
  }
};

module.exports = auth;
