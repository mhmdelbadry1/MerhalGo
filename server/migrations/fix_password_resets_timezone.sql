-- ============================================
-- Fix Timezone Issues in password_resets Table
-- ============================================
-- Change TIMESTAMP to TIMESTAMPTZ to properly handle UTC times

ALTER TABLE password_resets 
  ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at AT TIME ZONE 'UTC';

ALTER TABLE password_resets 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

ALTER TABLE password_resets 
  ALTER COLUMN used_at TYPE TIMESTAMPTZ USING used_at AT TIME ZONE 'UTC';

-- Verify the changes
COMMENT ON COLUMN password_resets.expires_at IS 'Token expiration timestamp (UTC timezone-aware)';
COMMENT ON COLUMN password_resets.created_at IS 'Token creation timestamp (UTC timezone-aware)';
COMMENT ON COLUMN password_resets.used_at IS 'Token usage timestamp (UTC timezone-aware)';

-- Clean up any expired tokens
DELETE FROM password_resets WHERE expires_at < NOW();

SELECT 'Migration complete! Timezone columns updated to TIMESTAMPTZ.' AS status;
