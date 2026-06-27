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

/**
 * Send email via Resend API
 */
export async function sendEmail(data: EmailData): Promise<EmailResponse> {
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;

  if (!apiKey) {
    console.error('Resend API key not configured');
    return {
      success: false,
      error: 'Email service not configured. Please add RESEND_API_KEY to environment variables.',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: data.from || 'Go Cargo Logistics <noreply@gocargologisticsus.com>',
        to: [data.to],
        subject: data.subject,
        html: data.html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return {
        success: false,
        error: result.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      emailId: result.id,
    };
  } catch (error: any) {
    console.error('Send email error:', error);
    return {
      success: false,
      error: error.message || 'Network error while sending email',
    };
  }
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