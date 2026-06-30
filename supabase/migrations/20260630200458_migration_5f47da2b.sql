-- Drop and recreate the constraint to include shipment_delayed
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'shipment_created'::text,
  'shipment_updated'::text,
  'shipment_delayed'::text,
  'quote_received'::text,
  'system_alert'::text
]));