import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Award, Users, Globe, Shield, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const stats = [
    { label: "Years in Business", value: "15+", icon: Award },
    { label: "Shipments Delivered", value: "50K+", icon: CheckCircle2 },
    { label: "Happy Customers", value: "10K+", icon: Users },
    { label: "Countries Served", value: "25+", icon: Globe },
  ];

  const values = [
    {
      icon: Shield,
      title: "Reliability",
      description: "On-time delivery and secure handling of every shipment"
    },
    {
      icon: CheckCircle2,
      title: "Quality",
      description: "Professional service that exceeds industry standards"
    },
    {
      icon: Clock,
      title: "Efficiency",
      description: "Fast processing and optimized logistics workflows"
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Dedicated support and personalized service"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="py-16 hero-gradient text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Trusted Logistics Partner
            </h1>
            <p className="text-lg text-white/90">
              Delivering excellence in shipping and transportation services across the United States and worldwide
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2010, Go Cargo Logistics has grown from a small regional carrier to a nationwide logistics powerhouse. Our journey began with a simple mission: to provide reliable, affordable vehicle transportation services that customers could trust.
                </p>
                <p>
                  Over the past 15 years, we've expanded our services to include freight shipping, container logistics, international transport, and specialized vehicle hauling. Today, we serve thousands of customers across 25 countries, handling everything from single-vehicle shipments to large-scale commercial freight.
                </p>
                <p>
                  Our commitment to excellence, innovative technology, and customer satisfaction has made us one of the most trusted names in logistics. We continue to invest in our fleet, technology, and team to ensure we remain at the forefront of the industry.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <CardContent className="pt-6 text-center">
                      <Icon className="w-12 h-12 text-primary mx-auto mb-3" />
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Mission & Vision</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-primary">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-3 text-primary">Mission</h3>
                  <p className="text-muted-foreground">
                    To provide world-class logistics solutions that connect businesses and individuals across the globe, delivering reliability, speed, and peace of mind with every shipment.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-accent">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-3 text-accent">Vision</h3>
                  <p className="text-muted-foreground">
                    To be the most trusted and innovative logistics partner worldwide, setting new standards for efficiency, sustainability, and customer service in the transportation industry.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.title}>
                    <CardContent className="pt-6 text-center">
                      <Icon className="w-10 h-10 text-primary mx-auto mb-3" />
                      <h3 className="font-bold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Why Choose Go Cargo Logistics?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We combine decades of experience with cutting-edge technology to deliver exceptional logistics solutions. Our nationwide network, professional team, and commitment to customer satisfaction set us apart.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">On-Time Delivery Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Customer Support</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Cargo Insurance Coverage</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}