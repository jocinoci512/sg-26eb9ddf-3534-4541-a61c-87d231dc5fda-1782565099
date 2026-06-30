-- Remove GPS coordinate columns from shipments table (simplification)
ALTER TABLE shipments 
DROP COLUMN IF EXISTS pickup_latitude,
DROP COLUMN IF EXISTS pickup_longitude,
DROP COLUMN IF EXISTS delivery_latitude,
DROP COLUMN IF EXISTS delivery_longitude,
DROP COLUMN IF EXISTS current_latitude,
DROP COLUMN IF EXISTS current_longitude;

-- Keep delay tracking columns as they're still useful
-- is_delayed, delay_duration_hours, delay_reason remain