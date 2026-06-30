-- Create user_settings table for notification preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email notification preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  email_shipment_created BOOLEAN DEFAULT true,
  email_shipment_picked_up BOOLEAN DEFAULT true,
  email_shipment_in_transit BOOLEAN DEFAULT true,
  email_shipment_delivered BOOLEAN DEFAULT true,
  email_shipment_delayed BOOLEAN DEFAULT true,
  email_quote_updates BOOLEAN DEFAULT true,
  
  -- Dashboard notification preferences
  dashboard_notifications_enabled BOOLEAN DEFAULT true,
  dashboard_shipment_updates BOOLEAN DEFAULT true,
  dashboard_quote_updates BOOLEAN DEFAULT true,
  dashboard_system_alerts BOOLEAN DEFAULT true,
  
  -- Notification frequency
  notification_frequency TEXT DEFAULT 'instant' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
  
  -- Future: SMS and push notifications
  sms_notifications_enabled BOOLEAN DEFAULT false,
  push_notifications_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings for new users
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();