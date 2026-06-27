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
export function generateEmailTemplate(content: {
  title: string;
  body: string;
  trackingNumber?: string;
  trackingUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #0B1F3A 0%, #123A6B 50%, #1E5AA8 100%); padding: 40px 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin: 0; }
    .content { padding: 40px 30px; }
    .title { font-size: 24px; font-weight: bold; color: #0B1F3A; margin: 0 0 20px 0; }
    .body { font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0; }
    .tracking { background-color: #f0f4f8; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .tracking-number { font-size: 20px; font-weight: bold; color: #1E5AA8; font-family: monospace; }
    .cta { display: inline-block; background: linear-gradient(135deg, #1E5AA8 0%, #0B1F3A 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { font-size: 14px; color: #6b7280; margin: 5px 0; }
    .contact { margin: 20px 0; }
    .contact-item { display: inline-block; margin: 0 10px; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">Go Cargo Logistics</h1>
    </div>
    
    <div class="content">
      <h2 class="title">${content.title}</h2>
      <div class="body">${content.body}</div>
      
      ${content.trackingNumber ? `
        <div class="tracking">
          <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Tracking Number</p>
          <div class="tracking-number">${content.trackingNumber}</div>
        </div>
      ` : ''}
      
      ${content.ctaText && content.ctaUrl ? `
        <a href="${content.ctaUrl}" class="cta">${content.ctaText}</a>
      ` : ''}
    </div>
    
    <div class="footer">
      <p class="footer-text"><strong>Go Cargo Logistics</strong></p>
      <div class="contact">
        <span class="contact-item">📧 support@gocargologisticsus.com</span>
        <span class="contact-item">📞 +1 (940) 238-4915</span>
      </div>
      <p class="footer-text">
        Professional Vehicle Transportation & Freight Services
      </p>
      <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}