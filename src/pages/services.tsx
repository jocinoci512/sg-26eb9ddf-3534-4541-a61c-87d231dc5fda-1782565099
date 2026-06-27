import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Truck, 
  Ship, 
  Plane, 
  Container, 
  Package,
  Shield,
  Clock,
  Globe,
  CheckCircle2
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: Truck,
      title: "Vehicle Transportation",
      description: "Safe and secure vehicle shipping across the country with open and enclosed carrier options.",
      features: ["Auto Transport", "Motorcycle Shipping", "RV Transport", "Boat Shipping"]
    },
    {
      icon: Container,
      title: "Freight Services",
      description: "Complete freight solutions for businesses of all sizes with flexible scheduling.",
      features: ["LTL Freight", "Full Truckload", "Expedited Shipping", "White Glove Service"]
    },
    {
      icon: Ship,
      title: "Ocean Freight",
      description: "International ocean shipping with full container and LCL services to major ports worldwide.",
      features: ["FCL Containers", "LCL Shipping", "Port-to-Port", "Door-to-Door"]
    },
    {
      icon: Plane,
      title: "Air Freight",
      description: "Fast international air cargo services for time-sensitive shipments and urgent deliveries.",
      features: ["Express Air", "Charter Services", "Customs Clearance", "Global Network"]
    },
    {
      icon: Package,
      title: "Warehousing",
      description: "Secure storage solutions with inventory management and distribution services.",
      features: ["Climate Control", "24/7 Security", "Inventory Management", "Pick & Pack"]
    },
    {
      icon: Globe,
      title: "International Shipping",
      description: "Complete international logistics with customs clearance and worldwide delivery.",
      features: ["Customs Brokerage", "Documentation", "Duty Management", "Global Tracking"]
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Full Insurance Coverage",
      description: "Every shipment is fully insured for peace of mind"
    },
    {
      icon: Clock,
      title: "On-Time Delivery",
      description: "98% on-time delivery rate across all services"
    },
    {
      icon: CheckCircle2,
      title: "Quality Assurance",
      description: "Professional handling and care for all shipments"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Service to 25+ countries with trusted partners"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Comprehensive logistics solutions for all your shipping needs
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/quote">
              <Button size="lg" className="btn-gradient text-white">
                Get a Free Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Services?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title}>
                  <CardContent className="pt-6 text-center">
                    <Icon className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h3 className="font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Contact our team today for a free quote or to discuss your logistics needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" className="btn-gradient text-white">
                Request a Quote
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}