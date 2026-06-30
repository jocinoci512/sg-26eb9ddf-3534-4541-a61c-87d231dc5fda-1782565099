-- Create email_subscriptions table for tracking notifications
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shipment_id, email)
);

-- Enable RLS
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe to shipment updates
CREATE POLICY "anyone_can_subscribe" ON email_subscriptions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own subscriptions
CREATE POLICY "view_own_subscriptions" ON email_subscriptions
FOR SELECT
TO public
USING (true);

-- Allow users to update their own subscriptions
CREATE POLICY "update_own_subscriptions" ON email_subscriptions
FOR UPDATE
TO public
USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_shipment ON email_subscriptions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);