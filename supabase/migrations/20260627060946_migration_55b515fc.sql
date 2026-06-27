-- Enable RLS on analytics tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_views
CREATE POLICY "anyone_can_insert_page_views" ON page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "staff_can_view_all_page_views" ON page_views
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

-- RLS Policies for user_sessions
CREATE POLICY "anyone_can_insert_user_sessions" ON user_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anyone_can_update_own_session" ON user_sessions
  FOR UPDATE
  USING (session_id IS NOT NULL);

CREATE POLICY "staff_can_view_all_user_sessions" ON user_sessions
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

-- RLS Policies for analytics_daily
CREATE POLICY "staff_can_view_analytics_daily" ON analytics_daily
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "staff_can_insert_analytics_daily" ON analytics_daily
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "staff_can_update_analytics_daily" ON analytics_daily
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid() AND is_active = true));