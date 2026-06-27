import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Truck, 
  Ship, 
  Plane, 
  Package, 
  Globe, 
  Shield, 
  Clock, 
  Award,
  Search,
  ArrowRight,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      window.location.href = `/tracking?number=${trackingNumber}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-24 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-0 px-4 py-2">
              Trusted Logistics Partner
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Professional Shipping & Vehicle Transportation
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90">
              Fast, reliable, and secure logistics services across the United States and internationally
            </p>

            <form onSubmit={handleTrackingSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2 bg-white rounded-lg p-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter tracking number (e.g., GCL123456789)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="pl-10 border-0 focus-visible:ring-0 h-12 text-foreground"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Track Shipment
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Get Instant Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/services/vehicle-shipping">
                <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive logistics solutions for all your shipping needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Vehicle Shipping</h3>
                <p className="text-muted-foreground mb-4">
                  Safe and secure auto transport with open and enclosed carrier options
                </p>
                <Link href="/services/vehicle-shipping" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Freight Services</h3>
                <p className="text-muted-foreground mb-4">
                  LTL and FTL freight shipping solutions for businesses nationwide
                </p>
                <Link href="/services/freight" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">International Shipping</h3>
                <p className="text-muted-foreground mb-4">
                  Global logistics with air, ocean, and rail freight options
                </p>
                <Link href="/services/international" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Ship className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Ocean Freight</h3>
                <p className="text-muted-foreground mb-4">
                  Container shipping solutions for large-scale cargo transport
                </p>
                <Link href="/services/ocean-freight" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Air Freight</h3>
                <p className="text-muted-foreground mb-4">
                  Express air cargo services for time-sensitive shipments
                </p>
                <Link href="/services/air-freight" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expedited Shipping</h3>
                <p className="text-muted-foreground mb-4">
                  Rush delivery services when you need it there fast
                </p>
                <Link href="/services/expedited" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Go Cargo Logistics</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Industry-leading logistics services you can trust
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fully Insured</h3>
              <p className="text-muted-foreground">
                Comprehensive insurance coverage on all shipments
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Track your shipment every step of the journey
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">On-Time Delivery</h3>
              <p className="text-muted-foreground">
                98% on-time delivery rate across all services
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
                24/7 customer support from logistics professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4">About Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Your Trusted Logistics Partner Since Day One
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Go Cargo Logistics is a leading provider of shipping and transportation services across the United States and internationally. We specialize in vehicle transport, freight shipping, and comprehensive logistics solutions.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Nationwide Coverage</h4>
                    <p className="text-muted-foreground">Shipping to all 50 states and international destinations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Professional Drivers</h4>
                    <p className="text-muted-foreground">Licensed, insured, and experienced carriers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold mb-1">Competitive Pricing</h4>
                    <p className="text-muted-foreground">Transparent quotes with no hidden fees</p>
                  </div>
                </div>
              </div>
              <Link href="/about">
                <Button size="lg">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary text-white p-8">
                  <div className="text-4xl font-bold mb-2">50K+</div>
                  <div className="text-white/80">Shipments Delivered</div>
                </Card>
                <Card className="bg-accent text-white p-8">
                  <div className="text-4xl font-bold mb-2">98%</div>
                  <div className="text-white/80">Customer Satisfaction</div>
                </Card>
                <Card className="bg-accent text-white p-8">
                  <div className="text-4xl font-bold mb-2">45+</div>
                  <div className="text-white/80">Countries Served</div>
                </Card>
                <Card className="bg-primary text-white p-8">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-white/80">Support Available</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Ship with Go Cargo Logistics?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Get your instant quote today and experience professional logistics service
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quote">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}