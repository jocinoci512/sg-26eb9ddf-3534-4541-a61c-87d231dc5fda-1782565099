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
  TrendingUp,
  FileText,
  Phone
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

      <section className="relative py-20 md:py-32 hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-fade-up">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                Trusted Global Logistics Partner
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up [animation-delay:100ms]">
              Ship Anywhere,
              <br />
              <span className="text-white/90">Track Everywhere</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-up [animation-delay:200ms]">
              Professional vehicle transportation and freight shipping services across the United States and worldwide with real-time tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up [animation-delay:300ms]">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-8 shadow-xl">
                <Link href="/quote">
                  <FileText className="w-5 h-5 mr-2" />
                  Get Free Quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8">
                <Link href="/tracking">
                  <Search className="w-5 h-5 mr-2" />
                  Track Shipment
                </Link>
              </Button>
            </div>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-fade-up [animation-delay:400ms]">
              <CardContent className="p-6">
                <form onSubmit={handleTrackingSearch} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter tracking number..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/90 text-foreground placeholder:text-muted-foreground border-white/30 h-12"
                  />
                  <Button type="submit" size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                    <Search className="w-5 h-5 mr-2" />
                    Track Now
                  </Button>
                </form>
              </CardContent>
            </Card>
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
            <Badge className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Go Cargo Logistics</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Industry-leading logistics services backed by reliability, technology, and expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-Time Tracking</h3>
                <p className="text-muted-foreground">
                  Live GPS tracking with detailed route information and estimated delivery times. Monitor your shipment every step of the journey with our enterprise-grade tracking system.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Nationwide Coverage</h3>
                <p className="text-muted-foreground">
                  Comprehensive shipping services across all 50 states and international destinations. From coast to coast, we deliver your cargo safely and on time.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Competitive Pricing</h3>
                <p className="text-muted-foreground">
                  Transparent quotes with no hidden fees. Get instant pricing for your shipment and enjoy competitive rates backed by exceptional service quality.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expert Support</h3>
                <p className="text-muted-foreground">
                  24/7 customer service from certified logistics professionals. Our experienced team is always ready to assist you with any shipping needs or questions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Fully Insured</h3>
                <p className="text-muted-foreground">
                  Comprehensive insurance coverage on all shipments for your peace of mind. Every cargo is protected from pickup to final delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">On-Time Delivery</h3>
                <p className="text-muted-foreground">
                  Industry-leading 98% on-time delivery rate across all services. We understand the importance of timely deliveries and make it our priority.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to get your shipment delivered safely and on time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Request Quote</h3>
                <p className="text-muted-foreground">
                  Submit your shipment details and receive an instant competitive quote with transparent pricing
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Book Shipment</h3>
                <p className="text-muted-foreground">
                  Confirm your booking and schedule a convenient pickup time that works for your schedule
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your shipment's real-time location with live GPS tracking and receive status updates
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Receive Delivery</h3>
                <p className="text-muted-foreground">
                  Safe arrival at your destination with delivery confirmation and proof of delivery documentation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Story</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Trusted Logistics Partner
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Go Cargo Logistics is a leading provider of shipping and transportation services across the United States and internationally. We specialize in vehicle transport, freight shipping, and comprehensive logistics solutions built on trust, reliability, and innovation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide reliable, efficient, and customer-focused logistics solutions that exceed expectations. We are committed to delivering excellence in every shipment, ensuring your cargo arrives safely and on time, every time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be the most trusted and innovative logistics partner in the industry, setting new standards for service quality, technology integration, and customer satisfaction. We envision a future where shipping is seamless, transparent, and stress-free.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-white/80 text-sm">Shipments Delivered</div>
            </Card>
            <Card className="bg-accent text-white p-6 text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/80 text-sm">On-Time Delivery</div>
            </Card>
            <Card className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-2">45+</div>
              <div className="text-white/80 text-sm">Countries Served</div>
            </Card>
            <Card className="bg-accent text-white p-6 text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/80 text-sm">Support Available</div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Core Values</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Drives Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every decision we make and every mile we travel
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reliability</h3>
                <p className="text-muted-foreground">
                  Consistent, dependable service you can count on. We honor our commitments and deliver results that build lasting trust with every shipment.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Integrity</h3>
                <p className="text-muted-foreground">
                  Honest, transparent business practices in everything we do. We believe in building relationships based on trust, honesty, and ethical conduct.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  Embracing technology and continuous improvement. We invest in cutting-edge tracking systems and processes to provide the best service possible.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Safety</h3>
                <p className="text-muted-foreground">
                  Protecting your cargo is our top priority. Every shipment is fully insured and handled with the utmost care by trained professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customer Focus</h3>
                <p className="text-muted-foreground">
                  Your success is our success. We listen to your needs, adapt to your requirements, and go above and beyond to ensure complete satisfaction.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  Striving for perfection in every detail. From the first quote to final delivery, we maintain the highest standards of quality and professionalism.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 hero-gradient text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Ship with Confidence?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Get started with a free quote or speak with our logistics experts today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-8 shadow-xl">
                <Link href="/quote">
                  <FileText className="w-5 h-5 mr-2" />
                  Request a Quote
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8">
                <Link href="/contact">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}