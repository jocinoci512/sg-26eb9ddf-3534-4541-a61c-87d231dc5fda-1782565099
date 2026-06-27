-- Enable RLS on all tables and create comprehensive security policies

-- Staff table RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view all staff" ON staff;
DROP POLICY IF EXISTS "Super admin can manage staff" ON staff;

CREATE POLICY "Authenticated users can view active staff"
  ON staff FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can update own record"
  ON staff FOR UPDATE
  USING (auth.uid() = user_id);

-- Customers table RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own record"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can update own record"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Customers can insert own record"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Carriers table RLS
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff can view carriers"
  ON carriers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Authenticated staff can manage carriers"
  ON carriers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Drivers table RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff can view drivers"
  ON drivers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Authenticated staff can manage drivers"
  ON drivers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Vehicles table RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated staff can manage vehicles"
  ON vehicles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Shipments table RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own shipments"
  ON shipments FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can view all shipments"
  ON shipments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Staff can manage shipments"
  ON shipments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Public can view shipment by tracking number"
  ON shipments FOR SELECT
  USING (true);

-- Tracking updates table RLS
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracking updates for accessible shipments"
  ON tracking_updates FOR SELECT
  USING (
    shipment_id IN (SELECT id FROM shipments)
  );

CREATE POLICY "Staff can manage tracking updates"
  ON tracking_updates FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Documents table RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for their shipments"
  ON documents FOR SELECT
  USING (
    shipment_id IN (
      SELECT id FROM shipments 
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Staff can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Staff can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Photos table RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos for their shipments"
  ON photos FOR SELECT
  USING (
    shipment_id IN (
      SELECT id FROM shipments 
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Staff can view all photos"
  ON photos FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Staff can manage photos"
  ON photos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Quotes table RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create quotes"
  ON quotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view all quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Staff can manage quotes"
  ON quotes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Notifications table RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    user_id = auth.uid() OR 
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff can manage all notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Blog categories RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage blog categories"
  ON blog_categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Blog posts RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Staff can manage blog posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Testimonials RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published testimonials"
  ON testimonials FOR SELECT
  USING (is_published = true OR EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Staff can manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- FAQs RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published FAQs"
  ON faqs FOR SELECT
  USING (is_published = true OR EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Staff can manage FAQs"
  ON faqs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Contact messages RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view all contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Staff can manage contact messages"
  ON contact_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

-- Activity logs RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "System can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- Settings RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true)
  );