const { createClient } = require('@supabase/supabase-js');

// Supabase Admin Client - Has full access to bypass RLS
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!serviceRoleKey) {
  console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables!');
} else if (serviceRoleKey === anonKey) {
  console.error('CRITICAL WARNING: SUPABASE_SERVICE_ROLE_KEY is identical to SUPABASE_ANON_KEY! Admin privileges will fail.');
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-supabase-role': 'service_role'
      }
    }
  }
);

// Supabase Client - Regular client for user operations
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  anonKey
);

module.exports = {
  supabaseAdmin,
  supabaseClient
};
