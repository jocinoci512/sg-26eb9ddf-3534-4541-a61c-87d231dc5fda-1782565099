/**
 * Delayed Shipment Notification Service
 * Automatically detects delayed shipments and sends notifications
 */

import { supabase } from "@/integrations/supabase/client";
import { sendShipmentStatusEmail } from "./emailService";
import { createNotification } from "./notificationService";

export interface DelayedShipment {
  id: string;
  tracking_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  estimated_delivery_date: string;
  current_status: string;
  pickup_city: string;
  pickup_state: string;
  delivery_city: string;
  delivery_state: string;
  delay_duration_hours: number;
}

/**
 * Check for delayed shipments and create notifications
 * A shipment is considered delayed if:
 * 1. Current date is past estimated delivery date
 * 2. Status is not 'delivered' or 'cancelled'
 * 3. No delay notification has been sent in the last 24 hours
 */
export async function checkForDelayedShipments(): Promise<DelayedShipment[]> {
  try {
    const now = new Date();
    
    // Query shipments that are past their estimated delivery date
    const { data: delayedShipments, error } = await supabase
      .from('shipments')
      .select(`
        id,
        tracking_number,
        customer_id,
        estimated_delivery_date,
        status,
        pickup_city,
        pickup_state,
        delivery_city,
        delivery_state,
        customers (
          full_name,
          email
        )
      `)
      .not('status', 'in', '("delivered","cancelled")')
      .not('estimated_delivery_date', 'is', null)
      .lt('estimated_delivery_date', now.toISOString());

    if (error) {
      console.error('Error fetching delayed shipments:', error);
      return [];
    }

    if (!delayedShipments || delayedShipments.length === 0) {
      return [];
    }

    const delayed: DelayedShipment[] = [];

    for (const shipment of delayedShipments) {
      const customer = shipment.customers as any;
      
      // Check if a delay notification was already sent recently (within 24 hours)
      const { data: recentNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', shipment.customer_id)
        .eq('shipment_id', shipment.id)
        .eq('type', 'shipment_delayed')
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      // Skip if notification was sent recently
      if (recentNotification) {
        continue;
      }

      // Calculate delay duration in hours
      const estimatedDate = new Date(shipment.estimated_delivery_date);
      const delayHours = Math.floor((now.getTime() - estimatedDate.getTime()) / (1000 * 60 * 60));

      delayed.push({
        id: shipment.id,
        tracking_number: shipment.tracking_number,
        customer_id: shipment.customer_id,
        customer_name: customer?.full_name || 'Customer',
        customer_email: customer?.email || '',
        estimated_delivery_date: shipment.estimated_delivery_date,
        current_status: shipment.status,
        pickup_city: shipment.pickup_city,
        pickup_state: shipment.pickup_state,
        delivery_city: shipment.delivery_city,
        delivery_state: shipment.delivery_state,
        delay_duration_hours: delayHours,
      });
    }

    return delayed;
  } catch (error) {
    console.error('Check delayed shipments error:', error);
    return [];
  }
}

/**
 * Process delayed shipments and send notifications
 */
export async function processDelayedShipments(): Promise<{
  processed: number;
  notificationsSent: number;
  emailsSent: number;
  errors: string[];
}> {
  const result = {
    processed: 0,
    notificationsSent: 0,
    emailsSent: 0,
    errors: [] as string[],
  };

  try {
    const delayedShipments = await checkForDelayedShipments();
    result.processed = delayedShipments.length;

    if (delayedShipments.length === 0) {
      return result;
    }

    for (const shipment of delayedShipments) {
      try {
        // Update shipment status to 'delayed' if not already
        if (shipment.current_status !== 'delayed') {
          const { error: updateError } = await supabase
            .from('shipments')
            .update({ status: 'delayed' })
            .eq('id', shipment.id);

          if (updateError) {
            result.errors.push(`Failed to update status for ${shipment.tracking_number}`);
            continue;
          }
        }

        // Create in-app notification for customer
        const notificationResult = await createNotification({
          userId: shipment.customer_id,
          type: 'shipment_delayed',
          title: 'Shipment Delayed',
          message: `Your shipment ${shipment.tracking_number} has been delayed by ${shipment.delay_duration_hours} hours. We apologize for the inconvenience and are working to resolve this.`,
          shipmentId: shipment.id,
        });

        if (notificationResult.success) {
          result.notificationsSent++;
        }

        // Send email notification to customer
        if (shipment.customer_email) {
          const emailResult = await sendShipmentStatusEmail(shipment.id, 'delayed');
          
          if (emailResult.success) {
            result.emailsSent++;
          } else {
            result.errors.push(`Failed to send email for ${shipment.tracking_number}: ${emailResult.error}`);
          }
        }

        // Create admin notification
        const { data: adminUsers } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(10);

        if (adminUsers && adminUsers.length > 0) {
          for (const admin of adminUsers) {
            await createNotification({
              userId: admin.id,
              type: 'shipment_delayed',
              title: 'Shipment Delay Alert',
              message: `Shipment ${shipment.tracking_number} is delayed by ${shipment.delay_duration_hours}h. Customer: ${shipment.customer_name}`,
              shipmentId: shipment.id,
            });
          }
        }

      } catch (error: any) {
        result.errors.push(`Error processing ${shipment.tracking_number}: ${error.message}`);
      }
    }

    return result;
  } catch (error: any) {
    console.error('Process delayed shipments error:', error);
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Get delay statistics
 */
export async function getDelayStatistics(): Promise<{
  total_delayed: number;
  average_delay_hours: number;
  delayed_this_week: number;
  delayed_this_month: number;
}> {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all delayed shipments
    const { data: allDelayed } = await supabase
      .from('shipments')
      .select('id, estimated_delivery_date')
      .eq('status', 'delayed');

    // Get delayed this week
    const { data: weekDelayed } = await supabase
      .from('shipments')
      .select('id')
      .eq('status', 'delayed')
      .gte('updated_at', weekAgo.toISOString());

    // Get delayed this month
    const { data: monthDelayed } = await supabase
      .from('shipments')
      .select('id')
      .eq('status', 'delayed')
      .gte('updated_at', monthAgo.toISOString());

    // Calculate average delay
    let totalDelayHours = 0;
    if (allDelayed && allDelayed.length > 0) {
      for (const shipment of allDelayed) {
        if (shipment.estimated_delivery_date) {
          const estimatedDate = new Date(shipment.estimated_delivery_date);
          const delayHours = Math.floor((now.getTime() - estimatedDate.getTime()) / (1000 * 60 * 60));
          if (delayHours > 0) {
            totalDelayHours += delayHours;
          }
        }
      }
    }

    const averageDelay = allDelayed && allDelayed.length > 0 
      ? Math.floor(totalDelayHours / allDelayed.length)
      : 0;

    return {
      total_delayed: allDelayed?.length || 0,
      average_delay_hours: averageDelay,
      delayed_this_week: weekDelayed?.length || 0,
      delayed_this_month: monthDelayed?.length || 0,
    };
  } catch (error) {
    console.error('Get delay statistics error:', error);
    return {
      total_delayed: 0,
      average_delay_hours: 0,
      delayed_this_week: 0,
      delayed_this_month: 0,
    };
  }
}

/**
 * Manually trigger delay notification for a specific shipment
 */
export async function triggerDelayNotification(shipmentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get shipment details
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        id,
        tracking_number,
        customer_id,
        estimated_delivery_date,
        status,
        customers (
          full_name,
          email
        )
      `)
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    const customer = shipment.customers as any;

    // Update status to delayed
    await supabase
      .from('shipments')
      .update({ status: 'delayed' })
      .eq('id', shipmentId);

    // Calculate delay duration
    const now = new Date();
    const estimatedDate = new Date(shipment.estimated_delivery_date);
    const delayHours = Math.floor((now.getTime() - estimatedDate.getTime()) / (1000 * 60 * 60));

    // Create notification
    await createNotification({
      userId: shipment.customer_id,
      type: 'shipment_delayed',
      title: 'Shipment Delayed',
      message: `Your shipment ${shipment.tracking_number} has been delayed by ${delayHours} hours. We apologize for the inconvenience.`,
      shipmentId: shipment.id,
    });

    // Send email
    if (customer?.email) {
      await sendShipmentStatusEmail(shipmentId, 'delayed');
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}