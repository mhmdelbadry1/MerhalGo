-- Check if new columns exist in company_profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'company_profiles'
  AND column_name IN (
    'representative_name',
    'whatsapp_number', 
    'commercial_register_file',
    'tax_card_file',
    'business_license_file',
    'additional_docs',
    'notes'
  )
ORDER BY column_name;
