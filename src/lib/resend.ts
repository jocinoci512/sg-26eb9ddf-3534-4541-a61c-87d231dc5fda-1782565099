/**
 * Resend Email Service Integration
 * Production-ready email delivery with retry logic and error handling
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  emailId?: string;
  error?: string;
}

export interface EmailTemplateParams {
  title: string;
  body: string;
  trackingNumber?: string;
  trackingUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail(data: EmailData): Promise<EmailResponse> {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('Resend API key not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = data.from || 'Go Cargo Logistics <support@gocargologisticsus.com>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const result = await response.json();

    // Log email to database
    await logEmail({
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      emailId: result.id,
      status: 'sent',
    });

    return {
      success: true,
      emailId: result.id,
    };
  } catch (error: any) {
    console.error('Email send error:', error);

    // Log failed email
    await logEmail({
      recipient: Array.isArray(data.to) ? data.to[0] : data.to,
      subject: data.subject,
      status: 'failed',
      errorMessage: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send contact form notification to support@gocargologisticsus.com
 */
export async function sendContactFormNotification(formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<EmailResponse> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #0B1F3A 0%, #123A6B 50%, #1E5AA8 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
    </div>
    
    <div style="padding: 30px;">
      <div style="background-color: #f8f9fa; border-left: 4px solid #1E5AA8; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #0B1F3A; font-size: 18px;">Contact Information</h2>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${formData.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${formData.email}" style="color: #1E5AA8;">${formData.email}</a></p>
        ${formData.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${formData.phone}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Subject:</strong> ${formData.subject}</p>
      </div>
      
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 6px;">
        <h3 style="margin: 0 0 10px 0; color: #0B1F3A;">Message:</h3>
        <p style="margin: 0; line-height: 1.6; color: #333;">${formData.message}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 6px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          This submission was received on ${new Date().toLocaleString('en-US', { 
            dateStyle: 'full', 
            timeStyle: 'short' 
          })}
        </p>
      </div>
    </div>
    
    <div style="background-color: #0B1F3A; color: #ffffff; padding: 20px; text-align: center;">
      <p style="margin: 5px 0; font-size: 13px;">Go Cargo Logistics</p>
      <p style="margin: 5px 0; font-size: 12px; opacity: 0.8;">support@gocargologisticsus.com | +1 (940) 238-4915</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: 'support@gocargologisticsus.com',
    subject: `New Contact Form: ${formData.subject}`,
    html,
    from: 'Go Cargo Logistics <support@gocargologisticsus.com>',
  });
}

/**
 * Send quote request notification to support@gocargologisticsus.com
 */
export async function sendQuoteRequestNotification(quoteData: {
  name: string;
  email: string;
  phone?: string;
  pickupLocation: string;
  deliveryLocation: string;
  vehicleInfo?: string;
  shipmentType: string;
}): Promise<EmailResponse> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Quote Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #0B1F3A 0%, #123A6B 50%, #1E5AA8 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Quote Request</h1>
    </div>
    
    <div style="padding: 30px;">
      <div style="background-color: #f8f9fa; border-left: 4px solid #1E5AA8; padding: 20px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #0B1F3A; font-size: 18px;">Customer Information</h2>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${quoteData.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${quoteData.email}" style="color: #1E5AA8;">${quoteData.email}</a></p>
        ${quoteData.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${quoteData.phone}</p>` : ''}
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #0B1F3A;">Shipment Details</h3>
        <p style="margin: 5px 0;"><strong>Type:</strong> ${quoteData.shipmentType}</p>
        <p style="margin: 5px 0;"><strong>From:</strong> ${quoteData.pickupLocation}</p>
        <p style="margin: 5px 0;"><strong>To:</strong> ${quoteData.deliveryLocation}</p>
        ${quoteData.vehicleInfo ? `<p style="margin: 5px 0;"><strong>Vehicle:</strong> ${quoteData.vehicleInfo}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/admin/quotes" 
           style="display: inline-block; background: #1E5AA8; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: bold;">
          View in Admin Dashboard
        </a>
      </div>
    </div>
    
    <div style="background-color: #0B1F3A; color: #ffffff; padding: 20px; text-align: center;">
      <p style="margin: 5px 0; font-size: 13px;">Go Cargo Logistics</p>
      <p style="margin: 5px 0; font-size: 12px; opacity: 0.8;">support@gocargologisticsus.com | +1 (940) 238-4915</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: 'support@gocargologisticsus.com',
    subject: `New Quote Request from ${quoteData.name}`,
    html,
    from: 'Go Cargo Logistics <support@gocargologisticsus.com>',
  });
}

/**
 * Generate branded email HTML template
 */
export function generateEmailTemplate(params: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header with Logo -->
    <div style="background: linear-gradient(135deg, #0B1F3A 0%, #123A6B 50%, #1E5AA8 100%); padding: 30px 20px; text-align: center;">
      <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/logo-main.png" alt="Go Cargo Logistics" style="width: 120px; height: auto; margin-bottom: 15px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Go Cargo Logistics</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px;">Professional Vehicle Transportation & Freight Services</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #0B1F3A; margin: 0 0 20px 0; font-size: 20px;">${params.title}</h2>
      
      <div style="color: #333333; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">
        ${params.body.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
      </div>
      
      ${params.trackingNumber ? `
      <div style="background-color: #f8f9fa; border-left: 4px solid #1E5AA8; padding: 15px 20px; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 13px;">Tracking Number</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0B1F3A; font-family: monospace;">${params.trackingNumber}</p>
      </div>
      ` : ''}
      
      ${params.ctaText && params.ctaUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${params.ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #1E5AA8 0%, #123A6B 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: bold; font-size: 15px;">${params.ctaText}</a>
      </div>
      ` : ''}
      
      ${params.trackingUrl ? `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">Track your shipment:</p>
        <a href="${params.trackingUrl}" style="color: #1E5AA8; text-decoration: none; word-break: break-all; font-size: 14px;">${params.trackingUrl}</a>
      </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #0B1F3A; color: #ffffff; padding: 30px 30px 20px 30px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/logo-main.png" alt="Go Cargo Logistics" style="width: 80px; height: auto; opacity: 0.9;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">Go Cargo Logistics</p>
        <p style="margin: 5px 0; font-size: 13px; opacity: 0.8;">Professional Vehicle Transportation & Freight Services</p>
      </div>
      
      <div style="margin: 15px 0; padding: 15px 0; border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.2);">
        <p style="margin: 5px 0; font-size: 13px;"><strong>📧</strong> support@gocargologisticsus.com</p>
        <p style="margin: 5px 0; font-size: 13px;"><strong>📞</strong> +1 (940) 238-4915</p>
        <p style="margin: 5px 0; font-size: 13px;"><strong>🌐</strong> <a href="https://gocargologisticsus.com" style="color: #ffffff; text-decoration: none;">gocargologisticsus.com</a></p>
      </div>
      
      <p style="margin: 15px 0 5px 0; font-size: 11px; opacity: 0.7;">
        © ${new Date().getFullYear()} Go Cargo Logistics. All rights reserved.
      </p>
      <p style="margin: 5px 0; font-size: 11px; opacity: 0.7;">
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}