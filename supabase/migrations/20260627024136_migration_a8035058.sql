-- Verify email_logs table exists and add email provider tracking
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'resend';
ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS resend_email_id VARCHAR(255);

-- Create index for faster email log queries
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- Add email settings table for admin configuration
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL DEFAULT 'resend',
  api_key_encrypted TEXT,
  from_email VARCHAR(255) NOT NULL DEFAULT 'noreply@gocargologisticsus.com',
  from_name VARCHAR(255) NOT NULL DEFAULT 'Go Cargo Logistics',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on email_settings
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admin can manage email settings
CREATE POLICY "super_admin_email_settings" ON email_settings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true));

COMMENT ON TABLE email_settings IS 'Email service configuration for automated notifications';