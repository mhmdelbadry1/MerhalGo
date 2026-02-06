-- Add missing columns to company_profiles table
-- These columns will store complete registration data

ALTER TABLE company_profiles 
ADD COLUMN IF NOT EXISTS representative_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS commercial_register_file TEXT,
ADD COLUMN IF NOT EXISTS tax_card_file TEXT,
ADD COLUMN IF NOT EXISTS business_license_file TEXT,
ADD COLUMN IF NOT EXISTS additional_docs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN company_profiles.representative_name IS 'Name of the company representative';
COMMENT ON COLUMN company_profiles.whatsapp_number IS 'WhatsApp number with country code';
COMMENT ON COLUMN company_profiles.commercial_register_file IS 'URL to commercial register document';
COMMENT ON COLUMN company_profiles.tax_card_file IS 'URL to tax card document';
COMMENT ON COLUMN company_profiles.business_license_file IS 'URL to business license document (optional)';
COMMENT ON COLUMN company_profiles.additional_docs IS 'Array of URLs to additional documents';
COMMENT ON COLUMN company_profiles.notes IS 'Additional notes from registration form';
