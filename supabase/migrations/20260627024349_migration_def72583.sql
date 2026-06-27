-- Verify and add missing columns to email_logs table
ALTER TABLE email_logs 
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing rows to have default values
UPDATE email_logs SET retry_count = 0 WHERE retry_count IS NULL;
UPDATE email_logs SET metadata = '{}'::jsonb WHERE metadata IS NULL;

-- Verify the structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'email_logs'
ORDER BY ordinal_position;