/**
 * Professional Email Templates for Go Cargo Logistics
 * Branded, responsive HTML email templates for all notification types
 */

interface EmailTemplateData {
  customerName: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  vehicleInfo?: string;
  quoteNumber?: string;
  amount?: string;
  status?: string;
  message?: string;
}

/**
 * Base email template wrapper with Go Cargo Logistics branding
 */
function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Go Cargo Logistics</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #0B1F3A 0%, #123A6B 50%, #1E5AA8 100%); padding: 40px 30px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; color: #ffffff; margin: 0; }
    .logo-subtitle { font-size: 12px; color: #ffffff; opacity: 0.9; letter-spacing: 2px; margin-top: 5px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #0B1F3A; margin-bottom: 20px; font-weight: 600; }
    .message { font-size: 15px; line-height: 1.6; color: #333333; margin-bottom: 25px; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #1E5AA8; padding: 20px; margin: 25px 0; border-radius: 4px; }
    .info-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .info-value { font-size: 16px; color: #0B1F3A; font-weight: 600; }
    .cta-button { display: inline-block; background: #1E5AA8; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .cta-button:hover { background: #123A6B; }
    .footer { background-color: #0B1F3A; color: #ffffff; padding: 30px; text-align: center; }
    .footer-links { margin: 15px 0; }
    .footer-link { color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 13px; opacity: 0.8; }
    .footer-info { font-size: 13px; opacity: 0.8; line-height: 1.6; margin-top: 15px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 30px 20px; }
      .cta-button { display: block; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="logo">Go Cargo Logistics</h1>
      <div class="logo-subtitle">RELIABLE • PROFESSIONAL • SECURE</div>
    </div>
    
    ${content}
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">Go Cargo Logistics</p>
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking" class="footer-link">Track Shipment</a>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/contact" class="footer-link">Contact Us</a>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/faq" class="footer-link">FAQ</a>
      </div>
      <div class="footer-info">
        <p style="margin: 5px 0;">📧 support@gocargologisticsus.com</p>
        <p style="margin: 5px 0;">📞 +1 (940) 238-4915</p>
        <p style="margin: 15px 0 5px 0; font-size: 11px; opacity: 0.6;">
          © ${new Date().getFullYear()} Go Cargo Logistics. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Shipment Created Email
 */
export function getShipmentCreatedEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Great news! Your shipment has been successfully created and is now in our system. We're preparing to transport your vehicle safely to its destination.
      </div>
      
      <div class="info-box">
        <div class="info-label">Tracking Number</div>
        <div class="info-value">${data.trackingNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Vehicle</div>
        <div class="info-value">${data.vehicleInfo}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Route</div>
        <div class="info-value">${data.pickupAddress} → ${data.deliveryAddress}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Estimated Delivery</div>
        <div class="info-value">${data.estimatedDelivery}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking?number=${data.trackingNumber}" class="cta-button">
          Track Your Shipment
        </a>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        You'll receive updates throughout the shipping process. If you have any questions, our support team is available 24/7.
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Shipment Picked Up Email
 */
export function getShipmentPickedUpEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Your vehicle has been picked up and is now loaded onto our carrier. It's on its way to the destination!
      </div>
      
      <div class="info-box">
        <div class="info-label">Tracking Number</div>
        <div class="info-value">${data.trackingNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Current Status</div>
        <div class="info-value" style="color: #16a34a;">Picked Up</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Estimated Delivery</div>
        <div class="info-value">${data.estimatedDelivery}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking?number=${data.trackingNumber}" class="cta-button">
          Track Live Location
        </a>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        You can now track your vehicle's live location on our GPS tracking map.
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Shipment In Transit Email
 */
export function getShipmentInTransitEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Your vehicle is currently in transit and making good progress toward its destination.
      </div>
      
      <div class="info-box">
        <div class="info-label">Tracking Number</div>
        <div class="info-value">${data.trackingNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Current Status</div>
        <div class="info-value" style="color: #1E5AA8;">In Transit</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Estimated Delivery</div>
        <div class="info-value">${data.estimatedDelivery}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking?number=${data.trackingNumber}" class="cta-button">
          View Live Map
        </a>
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Shipment Out for Delivery Email
 */
export function getShipmentOutForDeliveryEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Great news! Your vehicle is out for delivery and will arrive at its destination soon.
      </div>
      
      <div class="info-box">
        <div class="info-label">Tracking Number</div>
        <div class="info-value">${data.trackingNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Current Status</div>
        <div class="info-value" style="color: #ea580c;">Out for Delivery</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Expected Delivery</div>
        <div class="info-value">${data.estimatedDelivery}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking?number=${data.trackingNumber}" class="cta-button">
          Track Final Mile
        </a>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        Please ensure someone is available to receive the delivery.
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Shipment Delivered Email
 */
export function getShipmentDeliveredEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Excellent! Your vehicle has been successfully delivered. Thank you for choosing Go Cargo Logistics!
      </div>
      
      <div class="info-box">
        <div class="info-label">Tracking Number</div>
        <div class="info-value">${data.trackingNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Status</div>
        <div class="info-value" style="color: #16a34a;">✓ Delivered</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Delivered To</div>
        <div class="info-value">${data.deliveryAddress}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/tracking?number=${data.trackingNumber}" class="cta-button">
          View Shipment Details
        </a>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        We hope you had a great experience with Go Cargo Logistics. We'd love to hear your feedback!
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Shipment Delayed Email
 */
export function getShipmentDelayedEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        We wanted to inform you that your shipment has experienced a delay. We sincerely apologize for any inconvenience.
      </div>
      
      <div class="info-box">
        <div class="info-label">Tracking Number</div>
        <div class="info-value">${data.trackingNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Status</div>
        <div class="info-value" style="color: #dc2626;">Delayed</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Reason</div>
        <div class="info-value" style="font-size: 14px;">${data.message || 'Weather conditions / Traffic delays'}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">New Estimated Delivery</div>
        <div class="info-value">${data.estimatedDelivery}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/contact" class="cta-button">
          Contact Support
        </a>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        Our team is working to get your shipment back on track. We'll keep you updated.
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Quote Request Received Email
 */
export function getQuoteRequestReceivedEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Thank you for your quote request! We've received your information and our team is preparing a competitive quote for you.
      </div>
      
      <div class="info-box">
        <div class="info-label">Quote Reference</div>
        <div class="info-value">${data.quoteNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Vehicle</div>
        <div class="info-value">${data.vehicleInfo}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Route</div>
        <div class="info-value">${data.pickupAddress} → ${data.deliveryAddress}</div>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        You'll receive your personalized quote within 24 hours. Our team reviews each request carefully to provide the best pricing.
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/contact" class="cta-button">
          Contact Us
        </a>
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Quote Approved Email
 */
export function getQuoteApprovedEmail(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <div class="greeting">Hello ${data.customerName},</div>
      <div class="message">
        Great news! Your shipping quote has been approved and is ready for your review.
      </div>
      
      <div class="info-box">
        <div class="info-label">Quote Number</div>
        <div class="info-value">${data.quoteNumber}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Vehicle</div>
        <div class="info-value">${data.vehicleInfo}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Route</div>
        <div class="info-value">${data.pickupAddress} → ${data.deliveryAddress}</div>
      </div>
      
      <div class="info-box">
        <div class="info-label">Shipping Cost</div>
        <div class="info-value" style="font-size: 24px; color: #16a34a;">${data.amount}</div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://gocargologisticsus.com'}/contact" class="cta-button">
          Book Now
        </a>
      </div>
      
      <div class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
        This quote is valid for 7 days. Contact us to schedule your shipment or if you have any questions.
      </div>
    </div>
  `;
  
  return getEmailWrapper(content);
}

/**
 * Get email template by type
 */
export function getEmailTemplate(type: string, data: EmailTemplateData): string {
  switch (type) {
    case 'shipment_created':
      return getShipmentCreatedEmail(data);
    case 'shipment_picked_up':
      return getShipmentPickedUpEmail(data);
    case 'shipment_in_transit':
      return getShipmentInTransitEmail(data);
    case 'shipment_out_for_delivery':
      return getShipmentOutForDeliveryEmail(data);
    case 'shipment_delivered':
      return getShipmentDeliveredEmail(data);
    case 'shipment_delayed':
      return getShipmentDelayedEmail(data);
    case 'quote_received':
      return getQuoteRequestReceivedEmail(data);
    case 'quote_approved':
      return getQuoteApprovedEmail(data);
    default:
      return getShipmentCreatedEmail(data);
  }
}