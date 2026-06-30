-- Now we can safely alter the constraint to include 'shipment_delayed'
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'shipment_created', 
  'shipment_updated', 
  'shipment_delayed',
  'quote_received', 
  'system_alert'
));