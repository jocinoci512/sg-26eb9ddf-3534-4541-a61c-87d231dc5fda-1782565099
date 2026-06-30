-- Drop existing restrictive policy
DROP POLICY IF EXISTS "auth_can_manage_vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can view all vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can manage their vehicles" ON vehicles;

-- Create new policy allowing public to view vehicles in shipments
CREATE POLICY "public_can_view_shipment_vehicles" ON vehicles
FOR SELECT
TO public
USING (
  id IN (
    SELECT vehicle_id 
    FROM shipments 
    WHERE vehicle_id IS NOT NULL
  )
);

-- Recreate auth policy for managing vehicles (insert/update/delete)
CREATE POLICY "auth_can_manage_vehicles" ON vehicles
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);