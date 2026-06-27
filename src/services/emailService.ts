import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "./notificationService";
import { sendEmail, generateEmailTemplate } from "@/lib/resend";

interface SendEmailParams {
  recipientEmail: string;
  recipientName: string;
  templateKey: string;
  shipmentId?: string;
  variables: Record<string, string>;
}

/**
 * Email notification service
 * In production, this would integrate with an email service provider (SendGrid, Mailgun, etc.)
 * For now, we log email attempts to the database
 */
export const emailService = {
  /**
   * Send email notification
   */
  async sendEmail(params: SendEmailParams) {
    try {
      // Get email template
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_key', params.templateKey)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        console.error('Template not found:', params.templateKey);
        return { success: false, error: 'Template not found' };
      }

      // Replace variables in subject and body
      let subject = template.subject;
      let bodyHtml = template.body_html;
      let bodyText = template.body_text;

      Object.entries(params.variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        bodyHtml = bodyHtml.replace(new RegExp(placeholder, 'g'), value);
        bodyText = bodyText.replace(new RegExp(placeholder, 'g'), value);
      });

      // Log email to database
      const { error: logError } = await supabase
        .from('email_logs')
        .insert([
          {
            recipient_email: params.recipientEmail,
            subject,
            template_key: params.templateKey,
            shipment_id: params.shipmentId,
            status: 'sent', // In production, this would be 'pending' until actually sent
            sent_at: new Date().toISOString(),
          }
        ]);

      if (logError) {
        console.error('Error logging email:', logError);
      }

      // In production, send actual email via email service provider
      console.log('Email sent:', {
        to: params.recipientEmail,
        subject,
        template: params.templateKey,
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Send email error:', error);
      return { success: false, error };
    }
  },

  /**
   * Send shipment status update email
   */
  async sendShipmentStatusEmail(
    shipmentId: string,
    customerId: string,
    status: string,
    trackingNumber: string
  ) {
    try {
      // Get customer info
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('email, full_name, user_id')
        .eq('id', customerId)
        .single();

      if (customerError || !customer) {
        console.error('Customer not found');
        return { success: false };
      }

      // Get shipment details
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (shipmentError || !shipment) {
        console.error('Shipment not found');
        return { success: false };
      }

      // Map status to template key
      const templateMap: Record<string, string> = {
        'booked': 'shipment_created',
        'picked_up': 'shipment_picked_up',
        'in_transit': 'shipment_in_transit',
        'out_for_delivery': 'shipment_out_for_delivery',
        'delivered': 'shipment_delivered',
        'delayed': 'shipment_delayed',
      };

      const templateKey = templateMap[status] || 'shipment_in_transit';
      const trackingUrl = `${window.location.origin}/tracking?number=${trackingNumber}`;

      // Prepare email variables
      const variables: Record<string, string> = {
        customer_name: customer.full_name || 'Customer',
        tracking_number: trackingNumber,
        status: status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        pickup_location: `${shipment.pickup_city}, ${shipment.pickup_state}`,
        delivery_location: `${shipment.delivery_city}, ${shipment.delivery_state}`,
        tracking_url: trackingUrl,
        current_location: `${shipment.pickup_city}, ${shipment.pickup_state}`,
        estimated_delivery: shipment.estimated_delivery_date
          ? new Date(shipment.estimated_delivery_date).toLocaleDateString()
          : 'TBD',
        delivered_at: new Date().toLocaleDateString(),
        delay_reason: 'Weather conditions',
        new_eta: shipment.estimated_delivery_date
          ? new Date(new Date(shipment.estimated_delivery_date).getTime() + 86400000).toLocaleDateString()
          : 'TBD',
      };

      // Send email
      const emailResult = await this.sendEmail({
        recipientEmail: customer.email,
        recipientName: customer.full_name || 'Customer',
        templateKey,
        shipmentId,
        variables,
      });

      // Also create in-app notification
      if (customer.user_id) {
        await notificationService.notifyShipmentStatusChange(
          shipmentId,
          customerId,
          status,
          trackingNumber
        );
      }

      return emailResult;
    } catch (error) {
      console.error('Send shipment status email error:', error);
      return { success: false, error };
    }
  },

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
          customers (email, full_name),
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

      let bodyText = template.body
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
        status: emailResult.success ? 'sent' : 'failed',
        error_message: emailResult.error,
        metadata: {
          shipment_id: shipmentId,
          tracking_number: shipment.tracking_number,
          resend_email_id: emailResult.emailId,
        },
      });

      // Create notification
      if (shipment.customer_id) {
        await notificationService.createNotification({
          user_id: shipment.customer_id,
          title: subject,
          message: bodyText.substring(0, 200),
          type: 'shipment_update',
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

      if (!emailLog || !emailLog.metadata?.shipment_id) {
        return { success: false, error: 'Email log not found' };
      }

      const { data: shipment } = await supabase
        .from('shipments')
        .select('status')
        .eq('id', emailLog.metadata.shipment_id)
        .single();

      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }

      return await emailService.sendShipmentStatusEmail(
        emailLog.metadata.shipment_id,
        shipment.status,
        emailLog.recipient_email
      );
    } catch (error: any) {
      console.error('Retry email error:', error);
      return { success: false, error: error.message };
    }
  },
};