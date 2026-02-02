-- ============================================
-- Password Resets Table for MerhalGO
-- ============================================
-- This table stores password reset tokens for the forgot password functionality
-- Tokens expire after 1 hour and are marked as used after being consumed

-- Create the password_resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- Add comment to the table
COMMENT ON TABLE password_resets IS 'Stores password reset tokens with expiration and usage tracking';
COMMENT ON COLUMN password_resets.token IS 'Unique secure token sent in reset email';
COMMENT ON COLUMN password_resets.expires_at IS 'Token expiration timestamp (1 hour from creation)';
COMMENT ON COLUMN password_resets.used_at IS 'Timestamp when token was used (NULL if unused)';

-- Optional: Function to automatically delete expired tokens (runs daily)
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS void AS $$
BEGIN
  DELETE FROM password_resets 
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security (RLS) Configuration
-- ============================================

-- Enable RLS on the table
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can manage password resets" ON password_resets;
DROP POLICY IF EXISTS "No public access to password resets" ON password_resets;

-- Policy: Service role (backend) can do everything
CREATE POLICY "Service role can manage password resets" ON password_resets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Block all public access (no one can access via API)
CREATE POLICY "No public access to password resets" ON password_resets
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
