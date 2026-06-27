-- Create shipment events table for complete audit trail
CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT,
  performed_by_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_created_at ON shipment_events(created_at DESC);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_key TEXT,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_shipment_id ON email_logs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

COMMENT ON TABLE shipment_events IS 'Complete audit trail for all shipment changes';
COMMENT ON TABLE notifications IS 'Real-time notifications for customers and staff';
COMMENT ON TABLE email_templates IS 'Editable email templates for automated notifications';
COMMENT ON TABLE email_logs IS 'Log of all emails sent by the system';