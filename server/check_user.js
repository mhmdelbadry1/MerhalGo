require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const checkUser = async () => {
  const email = 'mohamedhassan221012@gmail.com'; 
  console.log(`Checking for user: ${email}`);

  // 1. Check Profiles Table
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  console.log('Profile Search Result:', profile ? 'FOUND' : 'NOT FOUND');
  if (profileError) console.log('Profile Error:', profileError.message);

  // 2. Check Auth Users
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Auth List Error:', authError);
    return;
  }

  const authUser = users.find(u => u.email === email);
  console.log('Auth User Search Result:', authUser ? 'FOUND' : 'NOT FOUND');
  
  if (!authUser && !profile) {
      console.log('User not found. Attempting to create user to reproduce error...');
      try {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
              email: email,
              password: 'TestPassword123!',
              email_confirm: true,
              user_metadata: {
                  full_name: 'Test Company',
                  role: 'company'
              }
          });
          
          if (error) {
              console.error('CREATE USER FAILED:', error);
          } else {
              console.log('CREATE USER SUCCESS:', data);
          }
      } catch (err) {
          console.error('CREATE USER EXCEPTION:', err);
      }
  } else {
      console.log('User already exists, so 500 error is likely due to duplicate handling logic which should be fixed now?');
  }

};

checkUser();
