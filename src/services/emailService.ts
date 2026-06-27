import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/lib/resend";
import { getEmailTemplate } from "@/lib/emailTemplates";

/**
 * Email Service
 * Handles all email notifications for shipments and quotes
 */

/**
 * Send shipment status update email to customer
 */
export async function sendShipmentStatusEmail(
  shipmentId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get shipment details with customer and vehicle info
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        *,
        customers (full_name, email),
        vehicles (make, model, year)
      `)
      .eq('id', shipmentId)
      .maybeSingle();

    if (shipmentError || !shipment) {
      throw new Error('Shipment not found');
    }

    const customer = shipment.customers;
    const vehicle = shipment.vehicles;

    if (!customer?.email) {
      throw new Error('Customer email not found');
    }

    // Map status to email template type
    const emailType = getEmailTypeFromStatus(status);
    
    // Prepare email data
    const emailData = {
      customerName: customer.full_name,
      trackingNumber: shipment.tracking_number,
      estimatedDelivery: shipment.estimated_delivery_date || 'To be confirmed',
      pickupAddress: `${shipment.pickup_city}, ${shipment.pickup_state}`,
      deliveryAddress: `${shipment.delivery_city}, ${shipment.delivery_state}`,
      vehicleInfo: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle',
      status,
    };

    const htmlContent = getEmailTemplate(emailType, emailData);
    const subject = getEmailSubject(status, shipment.tracking_number);

    // Send email
    const result = await sendEmail({
      to: customer.email,
      subject,
      html: htmlContent,
    });

    return result;
  } catch (error: any) {
    console.error('Send shipment status email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send quote notification email
 */
export async function sendQuoteNotificationEmail(
  quoteId: string,
  notificationType: 'received' | 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    if (!quote.customer_email) {
      throw new Error('Customer email not found');
    }

    // Prepare email data
    const emailData = {
      customerName: quote.customer_name,
      quoteNumber: quote.quote_number,
      pickupAddress: `${quote.pickup_city}, ${quote.pickup_state}`,
      deliveryAddress: `${quote.delivery_city}, ${quote.delivery_state}`,
      vehicleInfo: quote.vehicle_make && quote.vehicle_model 
        ? `${quote.vehicle_year || ''} ${quote.vehicle_make} ${quote.vehicle_model}`.trim()
        : 'Vehicle',
      amount: 'Pending', // Quote amount will be added when admin provides it
    };

    const emailType = `quote_${notificationType}`;
    const htmlContent = getEmailTemplate(emailType, emailData);
    const subject = getQuoteEmailSubject(notificationType, quote.quote_number);

    // Send email
    const result = await sendEmail({
      to: quote.customer_email,
      subject,
      html: htmlContent,
    });

    return result;
  } catch (error: any) {
    console.error('Send quote notification email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Map shipment status to email template type
 */
function getEmailTypeFromStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'booked': 'shipment_created',
    'pending_pickup': 'shipment_created',
    'picked_up': 'shipment_picked_up',
    'in_transit': 'shipment_in_transit',
    'out_for_delivery': 'shipment_out_for_delivery',
    'delivered': 'shipment_delivered',
    'delayed': 'shipment_delayed',
  };

  return statusMap[status] || 'shipment_created';
}

/**
 * Get email subject based on status
 */
function getEmailSubject(status: string, trackingNumber: string): string {
  const subjectMap: { [key: string]: string } = {
    'booked': 'Shipment Created',
    'pending_pickup': 'Shipment Scheduled',
    'picked_up': 'Vehicle Picked Up',
    'in_transit': 'Shipment In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Shipment Delivered',
    'delayed': 'Shipment Delayed - Update',
  };

  const statusText = subjectMap[status] || 'Shipment Update';
  return `${statusText} - ${trackingNumber}`;
}

/**
 * Get quote email subject
 */
function getQuoteEmailSubject(type: string, quoteNumber: string): string {
  const subjectMap: { [key: string]: string } = {
    'received': 'Quote Request Received',
    'approved': 'Your Shipping Quote is Ready',
    'rejected': 'Quote Update',
  };

  const typeText = subjectMap[type] || 'Quote Update';
  return `${typeText} - ${quoteNumber}`;
}