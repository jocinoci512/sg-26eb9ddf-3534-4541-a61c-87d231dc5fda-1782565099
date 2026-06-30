-- Add GPS coordinate columns and delay tracking to shipments table
ALTER TABLE shipments 
  ADD COLUMN IF NOT EXISTS pickup_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS pickup_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS is_delayed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS delay_duration_hours INTEGER,
  ADD COLUMN IF NOT EXISTS delay_reason TEXT;

-- Add index for GPS queries
CREATE INDEX IF NOT EXISTS idx_shipments_current_location 
  ON shipments(current_latitude, current_longitude) 
  WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;

-- Add index for delayed shipments
CREATE INDEX IF NOT EXISTS idx_shipments_delayed 
  ON shipments(is_delayed) 
  WHERE is_delayed = true;