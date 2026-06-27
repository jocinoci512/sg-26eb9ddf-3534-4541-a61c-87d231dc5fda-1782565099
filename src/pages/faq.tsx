import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What services does Go Cargo Logistics offer?",
          a: "We offer comprehensive logistics solutions including vehicle transportation (auto, motorcycle, RV, boat), freight services (LTL, FTL), ocean freight, air freight, warehousing, and international shipping to 25+ countries."
        },
        {
          q: "What areas do you service?",
          a: "We provide nationwide coverage across all 50 United States and international shipping to over 25 countries worldwide through our trusted partner network."
        },
        {
          q: "How do I get a quote?",
          a: "You can request a free quote through our online quote form, by calling +1 (940) 238-4915, or by emailing support@gocargologisticsus.com. Our team will respond within 24 hours with a detailed quote."
        },
      ]
    },
    {
      category: "Tracking & Delivery",
      questions: [
        {
          q: "How can I track my shipment?",
          a: "Simply enter your tracking number on our tracking page at gocargologisticsus.com/tracking. You'll see real-time updates including current location, status, and estimated delivery date."
        },
        {
          q: "How long does shipping take?",
          a: "Domestic shipments typically take 3-7 business days depending on distance and service level. Expedited service is available. International shipments vary by destination, generally 7-21 days."
        },
        {
          q: "What if my shipment is delayed?",
          a: "We maintain a 98% on-time delivery rate. In rare cases of delays, you'll receive immediate notification via email and can contact our support team 24/7 for updates and assistance."
        },
        {
          q: "Can I change the delivery address after shipment?",
          a: "Address changes are possible if the shipment hasn't reached final destination. Contact our support team immediately at +1 (940) 238-4915. Additional fees may apply."
        },
      ]
    },
    {
      category: "Vehicle Transportation",
      questions: [
        {
          q: "What's the difference between open and enclosed transport?",
          a: "Open transport uses open-air carriers (more economical, same carriers used by dealerships). Enclosed transport provides full protection from weather and road debris in a covered trailer (recommended for luxury, classic, or high-value vehicles)."
        },
        {
          q: "Is my vehicle insured during transport?",
          a: "Yes, all vehicles are fully insured during transport. We provide comprehensive cargo insurance coverage. You'll receive insurance documentation with your shipment confirmation."
        },
        {
          q: "Can I ship personal items in my vehicle?",
          a: "You can place up to 100 lbs of personal items in the trunk only. Items must not be visible and cannot exceed trunk capacity. Personal items are not covered by insurance."
        },
        {
          q: "How should I prepare my vehicle for shipping?",
          a: "Remove or secure loose items, ensure tire pressure is adequate, battery is charged, gas tank is 1/4 full or less, disable alarm systems, and document any existing damage with photos."
        },
      ]
    },
    {
      category: "Pricing & Payment",
      questions: [
        {
          q: "How is shipping cost calculated?",
          a: "Pricing depends on distance, shipment size/weight, service type (standard/expedited), special handling requirements, and current fuel costs. Request a free quote for accurate pricing."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept major credit cards (Visa, Mastercard, American Express), bank transfers, company checks, and ACH payments for business accounts."
        },
        {
          q: "When is payment due?",
          a: "For most shipments, a deposit is required to book the shipment, with the balance due upon delivery. Payment terms for business accounts are available upon approval."
        },
        {
          q: "Are there any hidden fees?",
          a: "No. Our quotes include all standard fees. Additional charges only apply for requested services not in the original quote (storage, redelivery, address changes, etc.) and are clearly communicated upfront."
        },
      ]
    },
    {
      category: "International Shipping",
      questions: [
        {
          q: "Do you handle customs clearance?",
          a: "Yes, we provide complete customs brokerage services including documentation, duty calculation, and clearance coordination for all international shipments."
        },
        {
          q: "What documents are needed for international shipping?",
          a: "Required documents typically include commercial invoice, packing list, bill of lading, and destination country-specific forms. Our team will provide a complete checklist and assist with documentation."
        },
        {
          q: "Who pays customs duties and taxes?",
          a: "The receiver is typically responsible for customs duties, taxes, and clearance fees in the destination country. We can provide estimates and assist with duty calculations."
        },
      ]
    },
    {
      category: "Claims & Insurance",
      questions: [
        {
          q: "What if my shipment is damaged?",
          a: "Inspect your shipment upon delivery and note any damage on the delivery receipt. Contact us immediately to file a claim. Our team will guide you through the claims process."
        },
        {
          q: "How long do I have to file a claim?",
          a: "Damage claims must be filed within 48 hours of delivery. Missing shipment claims should be filed within 7 days. Time-sensitive claims receive priority processing."
        },
        {
          q: "What's covered under cargo insurance?",
          a: "Our comprehensive cargo insurance covers damage, loss, or theft during transit. Coverage limits and details are provided in your shipment confirmation. Additional coverage options are available."
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-16">
        <div className="container text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-white/90">
            Find answers to common questions about our services
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          {faqs.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`${category.category}-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          <Card className="p-8 text-center bg-muted/30">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help with any questions or concerns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="btn-gradient text-white">
                  Contact Support
                </Button>
              </Link>
              <Link href="/quote">
                <Button size="lg" variant="outline">
                  Get a Quote
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}