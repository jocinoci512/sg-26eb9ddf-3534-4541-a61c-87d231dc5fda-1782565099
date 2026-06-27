import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuotePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    pickup_address: "",
    delivery_address: "",
    shipment_type: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    preferred_pickup_date: "",
    additional_notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('quotes').insert([
        {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          pickup_address: formData.pickup_address,
          pickup_city: "",
          pickup_state: "",
          pickup_zip: "",
          delivery_address: formData.delivery_address,
          delivery_city: "",
          delivery_state: "",
          delivery_zip: "",
          shipping_type: formData.shipment_type as any,
          vehicle_make: formData.vehicle_make || null,
          vehicle_model: formData.vehicle_model || null,
          vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year) : 0,
          preferred_pickup_date: formData.preferred_pickup_date || null,
          notes: formData.additional_notes || null,
          status: 'pending',
        }
      ]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Quote Request Submitted",
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });
    } catch (error) {
      console.error('Quote submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <section className="flex-1 flex items-center justify-center py-20 bg-muted/30">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Quote Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest. Our team will review your request and send you a detailed quote within 24 hours.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Check your email at <strong>{formData.customer_email}</strong> for updates.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Submit Another Quote
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get a Free Quote</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Fill out the form below and receive a competitive shipping quote within 24 hours
          </p>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Quote Request Form</CardTitle>
              <CardDescription>
                Provide details about your shipment and we'll send you a customized quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name">Full Name *</Label>
                      <Input
                        id="customer_name"
                        required
                        value={formData.customer_name}
                        onChange={(e) => handleChange('customer_name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email *</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        required
                        value={formData.customer_email}
                        onChange={(e) => handleChange('customer_email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">Phone Number *</Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => handleChange('customer_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Shipment Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup_address">Pickup Address *</Label>
                      <Textarea
                        id="pickup_address"
                        required
                        value={formData.pickup_address}
                        onChange={(e) => handleChange('pickup_address', e.target.value)}
                        placeholder="123 Main St, City, State ZIP"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <Textarea
                        id="delivery_address"
                        required
                        value={formData.delivery_address}
                        onChange={(e) => handleChange('delivery_address', e.target.value)}
                        placeholder="456 Oak Ave, City, State ZIP"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipment_type">Shipment Type *</Label>
                      <Select
                        required
                        value={formData.shipment_type}
                        onValueChange={(value) => handleChange('shipment_type', value)}
                      >
                        <SelectTrigger id="shipment_type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vehicle_shipping">Vehicle Shipping</SelectItem>
                          <SelectItem value="freight">Freight</SelectItem>
                          <SelectItem value="container">Container</SelectItem>
                          <SelectItem value="air_freight">Air Freight</SelectItem>
                          <SelectItem value="ocean_freight">Ocean Freight</SelectItem>
                          <SelectItem value="rail_freight">Rail Freight</SelectItem>
                          <SelectItem value="expedited">Expedited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferred_pickup_date">Preferred Pickup Date</Label>
                      <Input
                        id="preferred_pickup_date"
                        type="date"
                        value={formData.preferred_pickup_date}
                        onChange={(e) => handleChange('preferred_pickup_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {(formData.shipment_type === 'vehicle_shipping') && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Vehicle Information</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="vehicle_make">Make</Label>
                        <Input
                          id="vehicle_make"
                          value={formData.vehicle_make}
                          onChange={(e) => handleChange('vehicle_make', e.target.value)}
                          placeholder="Toyota"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle_model">Model</Label>
                        <Input
                          id="vehicle_model"
                          value={formData.vehicle_model}
                          onChange={(e) => handleChange('vehicle_model', e.target.value)}
                          placeholder="Camry"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicle_year">Year</Label>
                        <Input
                          id="vehicle_year"
                          value={formData.vehicle_year}
                          onChange={(e) => handleChange('vehicle_year', e.target.value)}
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <Textarea
                    id="additional_notes"
                    value={formData.additional_notes}
                    onChange={(e) => handleChange('additional_notes', e.target.value)}
                    placeholder="Any special requirements or additional information..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full btn-gradient text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Get Free Quote
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}