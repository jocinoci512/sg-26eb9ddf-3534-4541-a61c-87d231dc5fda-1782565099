import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-xl text-white/90">
            Last Updated: June 27, 2026
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-4xl prose prose-slate">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Go Cargo Logistics services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Services Provided</h2>
          <p>
            Go Cargo Logistics provides vehicle transportation, freight shipping, warehousing, and logistics services. Services are subject to availability and may vary by location.
          </p>

          <h2>3. Booking and Quotes</h2>
          <p>
            All quotes are estimates and subject to change based on actual shipment details. A confirmed booking requires acceptance of the final quote and payment terms. Quotes are valid for 30 days from issuance.
          </p>

          <h2>4. Payment Terms</h2>
          <p>
            Payment terms vary by service type. Standard terms require a deposit upon booking with the balance due upon delivery. We accept major credit cards, bank transfers, and company checks. Late payments may incur additional fees.
          </p>

          <h2>5. Shipping and Delivery</h2>
          <p>
            Estimated delivery dates are approximations and not guarantees. We are not liable for delays caused by weather, traffic, customs, or other circumstances beyond our control. Customers will be notified of significant delays.
          </p>

          <h2>6. Insurance and Liability</h2>
          <p>
            All shipments include basic cargo insurance. Additional coverage is available upon request. Go Cargo Logistics' liability is limited to the declared value of the shipment or actual cash value, whichever is less. Claims must be filed within 48 hours of delivery for damage or 7 days for loss.
          </p>

          <h2>7. Customer Responsibilities</h2>
          <p>
            Customers must provide accurate shipment information, properly package items, ensure accessibility for pickup and delivery, and be available for scheduled appointments. For vehicle shipping, customers must prepare vehicles according to our guidelines.
          </p>

          <h2>8. Prohibited Items</h2>
          <p>
            We do not ship hazardous materials, illegal substances, weapons, live animals (except as specifically arranged), perishable goods without proper arrangements, or items prohibited by law. Personal items in vehicles are limited to 100 lbs in the trunk.
          </p>

          <h2>9. Cancellation and Refunds</h2>
          <p>
            Cancellations made more than 48 hours before scheduled pickup receive a full refund minus administrative fees. Cancellations within 48 hours forfeit the deposit. No refunds for shipments in transit unless services are not rendered.
          </p>

          <h2>10. International Shipping</h2>
          <p>
            International shipments are subject to customs regulations and duties of destination countries. Customers are responsible for all customs fees, duties, and taxes. We provide customs brokerage assistance but are not responsible for customs delays or rejections.
          </p>

          <h2>11. Privacy and Data Protection</h2>
          <p>
            We collect and use personal information in accordance with our Privacy Policy. By using our services, you consent to our data practices as described in the Privacy Policy.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            Go Cargo Logistics shall not be liable for indirect, incidental, special, or consequential damages. Our total liability shall not exceed the value of the shipment or the shipping charges paid, whichever is greater.
          </p>

          <h2>13. Force Majeure</h2>
          <p>
            We are not liable for failures or delays caused by events beyond our reasonable control, including natural disasters, war, terrorism, strikes, government actions, or pandemic-related restrictions.
          </p>

          <h2>14. Dispute Resolution</h2>
          <p>
            Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the United States and be governed by U.S. law.
          </p>

          <h2>15. Modifications to Terms</h2>
          <p>
            Go Cargo Logistics reserves the right to modify these Terms and Conditions at any time. Changes will be posted on our website with an updated effective date. Continued use of our services constitutes acceptance of modified terms.
          </p>

          <h2>16. Contact Information</h2>
          <p>
            For questions about these Terms and Conditions, please contact us at:
          </p>
          <ul>
            <li>Email: support@gocargologisticsus.com</li>
            <li>Phone: +1 (940) 238-4915</li>
            <li>Website: gocargologisticsus.com</li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}