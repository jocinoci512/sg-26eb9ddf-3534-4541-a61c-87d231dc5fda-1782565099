/**
 * GPS Monitoring Service
 * Automatically updates shipment status based on real-time GPS coordinates
 */

import { supabase } from "@/integrations/supabase/client";
import { sendShipmentStatusEmail } from "./emailService";
import { createNotification } from "./notificationService";

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two GPS coordinates in kilometers
 * Uses Haversine formula
 */
export function calculateDistance(
  coord1: GPSCoordinates,
  coord2: GPSCoordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if vehicle is within geofence radius (default 0.5km)
 */
export function isWithinGeofence(
  vehicleLocation: GPSCoordinates,
  targetLocation: GPSCoordinates,
  radiusKm: number = 0.5
): boolean {
  const distance = calculateDistance(vehicleLocation, targetLocation);
  return distance <= radiusKm;
}

/**
 * Monitor shipment and update status based on GPS location
 */
export async function monitorShipmentLocation(
  shipmentId: string,
  currentGPS: GPSCoordinates
): Promise<{ success: boolean; statusChanged?: boolean; newStatus?: string; error?: string }> {
  try {
    // Get shipment details
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        *,
        customers (id, email, full_name)
      `)
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    // Skip if shipment is already delivered or cancelled
    if (['delivered', 'cancelled'].includes(shipment.status)) {
      return { success: true, statusChanged: false };
    }

    let statusChanged = false;
    let newStatus = shipment.status;

    // Convert addresses to coordinates (simplified - in production, use geocoding service)
    // For now, we'll check if pickup/delivery coordinates are stored
    const pickupCoords = shipment.pickup_latitude && shipment.pickup_longitude
      ? { latitude: shipment.pickup_latitude, longitude: shipment.pickup_longitude }
      : null;

    const deliveryCoords = shipment.delivery_latitude && shipment.delivery_longitude
      ? { latitude: shipment.delivery_latitude, longitude: shipment.delivery_longitude }
      : null;

    // Check arrival at pickup location
    if (
      pickupCoords &&
      ['booked', 'pending_pickup'].includes(shipment.status) &&
      isWithinGeofence(currentGPS, pickupCoords, 0.5)
    ) {
      newStatus = 'picked_up';
      statusChanged = true;
    }

    // Check arrival at delivery location
    if (
      deliveryCoords &&
      ['in_transit', 'out_for_delivery'].includes(shipment.status) &&
      isWithinGeofence(currentGPS, deliveryCoords, 0.5)
    ) {
      newStatus = 'delivered';
      statusChanged = true;
    }

    // Update shipment status if changed
    if (statusChanged) {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set actual delivery date if delivered
      if (newStatus === 'delivered') {
        updateData.actual_delivery_date = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipmentId);

      if (updateError) throw updateError;

      // Send notification email
      if (shipment.customers?.email) {
        await sendShipmentStatusEmail(shipmentId, newStatus);
      }

      // Create dashboard notification
      if (shipment.customers?.id) {
        await createNotification({
          userId: shipment.customers.id,
          type: 'shipment_updated',
          title: 'Shipment Status Updated',
          message: `Your shipment ${shipment.tracking_number} status has been automatically updated to: ${newStatus}`,
          shipmentId: shipmentId,
        });
      }

      console.log(`Shipment ${shipment.tracking_number} auto-updated: ${shipment.status} → ${newStatus}`);
    }

    return {
      success: true,
      statusChanged,
      newStatus: statusChanged ? newStatus : undefined,
    };
  } catch (error: any) {
    console.error('Monitor shipment location error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate real-time progress percentage based on GPS coordinates
 */
export function calculateShipmentProgress(
  currentLocation: GPSCoordinates,
  pickupLocation: GPSCoordinates,
  deliveryLocation: GPSCoordinates
): number {
  // Calculate total distance from pickup to delivery
  const totalDistance = calculateDistance(pickupLocation, deliveryLocation);

  // Calculate distance traveled from pickup to current location
  const traveledDistance = calculateDistance(pickupLocation, currentLocation);

  // Calculate progress percentage
  const progress = (traveledDistance / totalDistance) * 100;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/**
 * Detect if shipment is delayed based on GPS location and ETA
 */
export async function detectShipmentDelay(
  shipmentId: string,
  currentGPS: GPSCoordinates
): Promise<{ isDelayed: boolean; estimatedDelayHours?: number }> {
  try {
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (error || !shipment) {
      return { isDelayed: false };
    }

    // Skip if already marked as delayed or delivered
    if (shipment.is_delayed || shipment.status === 'delivered') {
      return { isDelayed: false };
    }

    // Check if estimated delivery date has passed
    if (shipment.estimated_delivery_date) {
      const eta = new Date(shipment.estimated_delivery_date);
      const now = new Date();

      if (now > eta) {
        const delayHours = Math.floor((now.getTime() - eta.getTime()) / (1000 * 60 * 60));

        // Mark shipment as delayed
        await supabase
          .from('shipments')
          .update({
            is_delayed: true,
            delay_duration_hours: delayHours,
            delay_reason: 'GPS tracking indicates delivery overdue',
            updated_at: new Date().toISOString(),
          })
          .eq('id', shipmentId);

        return { isDelayed: true, estimatedDelayHours: delayHours };
      }
    }

    return { isDelayed: false };
  } catch (error) {
    console.error('Detect shipment delay error:', error);
    return { isDelayed: false };
  }
}

/**
 * Batch monitor all active shipments (for scheduled jobs)
 */
export async function monitorAllActiveShipments(): Promise<{
  success: boolean;
  processed: number;
  updated: number;
  errors: number;
}> {
  try {
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('id, current_latitude, current_longitude')
      .in('status', ['in_transit', 'out_for_delivery', 'picked_up', 'pending_pickup'])
      .not('current_latitude', 'is', null)
      .not('current_longitude', 'is', null);

    if (error) throw error;

    let processed = 0;
    let updated = 0;
    let errors = 0;

    for (const shipment of shipments || []) {
      try {
        const result = await monitorShipmentLocation(
          shipment.id,
          {
            latitude: shipment.current_latitude!,
            longitude: shipment.current_longitude!,
          }
        );

        processed++;
        if (result.statusChanged) updated++;
      } catch (err) {
        errors++;
        console.error(`Error monitoring shipment ${shipment.id}:`, err);
      }
    }

    return { success: true, processed, updated, errors };
  } catch (error) {
    console.error('Monitor all shipments error:', error);
    return { success: false, processed: 0, updated: 0, errors: 0 };
  }
}