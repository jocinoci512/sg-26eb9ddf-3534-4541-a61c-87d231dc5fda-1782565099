import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "./notificationService";
import { sendEmail, generateEmailTemplate } from "@/lib/resend";

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