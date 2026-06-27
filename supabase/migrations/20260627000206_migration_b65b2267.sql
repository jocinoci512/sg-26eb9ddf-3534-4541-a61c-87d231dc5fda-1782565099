-- Function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  new_tracking_number TEXT;
  tracking_exists BOOLEAN;
BEGIN
  LOOP
    new_tracking_number := 'GCL' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
    SELECT EXISTS(SELECT 1 FROM shipments WHERE tracking_number = new_tracking_number) INTO tracking_exists;
    EXIT WHEN NOT tracking_exists;
  END LOOP;
  RETURN new_tracking_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  new_quote_number TEXT;
  quote_exists BOOLEAN;
BEGIN
  LOOP
    new_quote_number := 'QTE' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM quotes WHERE quote_number = new_quote_number) INTO quote_exists;
    EXIT WHEN NOT quote_exists;
  END LOOP;
  RETURN new_quote_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking number
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipments_tracking_number_trigger
BEFORE INSERT ON shipments
FOR EACH ROW
EXECUTE FUNCTION set_tracking_number();

-- Trigger to auto-generate quote number
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_quote_number_trigger
BEFORE INSERT ON quotes
FOR EACH ROW
EXECUTE FUNCTION set_quote_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON staff
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();