-- Enable RLS on new tables
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for shipment_events
CREATE POLICY "Staff can view all shipment events" ON shipment_events
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Staff can insert shipment events" ON shipment_events
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Customers can view their shipment events" ON shipment_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shipments s
      JOIN customers c ON s.customer_id = c.id
      WHERE s.id = shipment_events.shipment_id
      AND c.user_id = auth.uid()
    )
  );

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Staff can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

-- RLS policies for email_templates
CREATE POLICY "Staff can view email templates" ON email_templates
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Super admin can manage email templates" ON email_templates
  FOR ALL
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true));

-- RLS policies for email_logs
CREATE POLICY "Staff can view email logs" ON email_logs
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Staff can insert email logs" ON email_logs
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));