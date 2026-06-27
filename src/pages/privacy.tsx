import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-white/90">
            Last Updated: June 27, 2026
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-4xl prose prose-slate">
          <h2>1. Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>
            We collect personal information you provide when using our services, including:
          </p>
          <ul>
            <li>Name, email address, phone number</li>
            <li>Shipping addresses (pickup and delivery)</li>
            <li>Payment information</li>
            <li>Vehicle details (for vehicle shipping)</li>
            <li>Account credentials</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>
            We automatically collect certain information when you visit our website:
          </p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h3>Shipment Tracking Data</h3>
          <p>
            For shipments with GPS tracking, we collect real-time location data to provide tracking services and optimize delivery routes.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use collected information for the following purposes:
          </p>
          <ul>
            <li>Processing and fulfilling shipment orders</li>
            <li>Providing customer support and responding to inquiries</li>
            <li>Sending shipment updates and notifications</li>
            <li>Processing payments and preventing fraud</li>
            <li>Improving our services and website functionality</li>
            <li>Complying with legal obligations</li>
            <li>Marketing communications (with your consent)</li>
          </ul>

          <h2>3. Information Sharing and Disclosure</h2>
          <p>
            We do not sell your personal information. We may share information with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party carriers, payment processors, and technology providers who assist in delivering our services</li>
            <li><strong>Legal Requirements:</strong> Government authorities when required by law or to protect our legal rights</li>
            <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            <li><strong>With Your Consent:</strong> Other parties when you explicitly authorize sharing</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul>
            <li>Encrypted data transmission (SSL/TLS)</li>
            <li>Secure servers and databases</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits</li>
            <li>Employee training on data protection</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2>5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul>
            <li>Remember your preferences and settings</li>
            <li>Analyze website traffic and usage patterns</li>
            <li>Provide personalized content</li>
            <li>Improve website functionality</li>
          </ul>
          <p>
            You can control cookie preferences through your browser settings. Disabling cookies may limit website functionality.
          </p>

          <h2>6. Your Privacy Rights</h2>
          <p>
            Depending on your location, you may have the following rights:
          </p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Restriction:</strong> Request restricted processing of your information</li>
          </ul>
          <p>
            To exercise these rights, contact us at support@gocargologisticsus.com
          </p>

          <h2>7. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly collect personal information from children. If we learn we have collected information from a child under 13, we will delete it promptly.
          </p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for international transfers in compliance with applicable data protection laws.
          </p>

          <h2>9. Data Retention</h2>
          <p>
            We retain personal information for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements. Shipment records are typically retained for 7 years for legal and accounting purposes.
          </p>

          <h2>10. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to review their privacy policies.
          </p>

          <h2>11. California Privacy Rights (CCPA)</h2>
          <p>
            California residents have additional rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to know if personal information is sold or disclosed</li>
            <li>Right to opt-out of sale of personal information</li>
            <li>Right to deletion of personal information</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>

          <h2>12. European Privacy Rights (GDPR)</h2>
          <p>
            If you are in the European Economic Area, you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, and object to processing.
          </p>

          <h2>13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes by posting the updated policy on our website with a new effective date. Continued use of our services after changes constitutes acceptance.
          </p>

          <h2>14. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li>Email: support@gocargologisticsus.com</li>
            <li>Phone: +1 (940) 238-4915</li>
            <li>Mail: Go Cargo Logistics, United States</li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}