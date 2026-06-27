import { supabase } from "@/integrations/supabase/client";
import { sendEmail } from "@/lib/resend";
import { getEmailTemplate } from "@/lib/emailTemplates";

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
      .single();

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
      .single();

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
      amount: quote.quote_amount ? `$${quote.quote_amount.toLocaleString()}` : 'Pending',
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

export const emailService = {
  /**
   * Send shipment status change email
   */
  sendShipmentStatusEmail: async (shipmentId: string, status: string, customerEmail?: string) => {
    try {
      // Get shipment details
      const { data: shipment } = await supabase
        .from('shipments')
        .select(`
          *,
          customers (email, full_name, user_id),
          vehicles (make, model, year)
        `)
        .eq('id', shipmentId)
        .single();

      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }

      const recipientEmail = customerEmail || shipment.customers?.email;
      if (!recipientEmail) {
        return { success: false, error: 'No customer email found' };
      }

      // Get email template
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_key', `shipment_${status}`)
        .maybeSingle();

      if (!template) {
        return { success: false, error: 'Email template not found' };
      }

      // Replace template variables
      const subject = template.subject
        .replace('{{tracking_number}}', shipment.tracking_number)
        .replace('{{customer_name}}', shipment.customers?.full_name || 'Customer');

      let bodyText = template.body_text
        .replace('{{customer_name}}', shipment.customers?.full_name || 'Customer')
        .replace('{{tracking_number}}', shipment.tracking_number)
        .replace('{{pickup_city}}', shipment.pickup_city)
        .replace('{{delivery_city}}', shipment.delivery_city)
        .replace('{{status}}', status.replace('_', ' ').toUpperCase());

      if (shipment.estimated_delivery_date) {
        const eta = new Date(shipment.estimated_delivery_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        bodyText = bodyText.replace('{{estimated_delivery}}', eta);
      }

      const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking?number=${shipment.tracking_number}`;

      // Generate HTML email
      const htmlContent = generateEmailTemplate({
        title: subject,
        body: bodyText,
        trackingNumber: shipment.tracking_number,
        trackingUrl,
        ctaText: 'Track Shipment',
        ctaUrl: trackingUrl,
      });

      // Send email via Resend
      const emailResult = await sendEmail({
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      // Log email attempt
      await supabase.from('email_logs').insert({
        recipient_email: recipientEmail,
        subject,
        template_key: template.template_key,
        shipment_id: shipmentId,
        status: emailResult.success ? 'sent' : 'failed',
        error_message: emailResult.error || null,
        provider: 'resend',
        resend_email_id: emailResult.emailId || null,
        retry_count: 0,
        metadata: {
          shipment_id: shipmentId,
          tracking_number: shipment.tracking_number,
        },
      });

      // Create notification
      if (shipment.customers?.user_id) {
        await notificationService.createNotification({
          userId: shipment.customers.user_id,
          title: subject,
          message: bodyText.substring(0, 200),
          type: 'shipment_updated',
          metadata: {
            shipment_id: shipmentId,
            tracking_number: shipment.tracking_number,
            status,
          },
        });
      }

      return { success: emailResult.success, emailId: emailResult.emailId };
    } catch (error: any) {
      console.error('Send shipment status email error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Retry failed email
   */
  retryEmail: async (emailLogId: string) => {
    try {
      const { data: emailLog } = await supabase
        .from('email_logs')
        .select('*')
        .eq('id', emailLogId)
        .single();

      if (!emailLog) {
        return { success: false, error: 'Email log not found' };
      }

      const metadata = emailLog.metadata as any;
      if (!metadata?.shipment_id) {
        return { success: false, error: 'Shipment ID not found in email log' };
      }

      const { data: shipment } = await supabase
        .from('shipments')
        .select('status')
        .eq('id', metadata.shipment_id)
        .single();

      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }

      // Increment retry count
      await supabase
        .from('email_logs')
        .update({ retry_count: (emailLog.retry_count || 0) + 1 })
        .eq('id', emailLogId);

      return await emailService.sendShipmentStatusEmail(
        metadata.shipment_id,
        shipment.status,
        emailLog.recipient_email
      );
    } catch (error: any) {
      console.error('Retry email error:', error);
      return { success: false, error: error.message };
    }
  },
};