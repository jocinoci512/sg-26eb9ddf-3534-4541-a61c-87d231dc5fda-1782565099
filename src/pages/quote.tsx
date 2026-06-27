import { useState, FormEvent } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Package, Loader2 } from "lucide-react";
import { sendQuoteRequestNotification } from "@/lib/resend";
import { supabase } from "@/integrations/supabase/client";

export default function Quote() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupZip, setPickupZip] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [shipmentType, setShipmentType] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save quote to database
      const { error: dbError } = await supabase.from('quotes').insert([
        {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          pickup_address: pickupAddress,
          pickup_city: pickupCity,
          pickup_state: pickupState,
          pickup_zip: pickupZip,
          delivery_address: deliveryAddress,
          delivery_city: deliveryCity,
          delivery_state: deliveryState,
          delivery_zip: deliveryZip,
          shipment_type: shipmentType,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear ? parseInt(vehicleYear) : null,
          notes,
          status: 'pending',
        }
      ]);

      if (dbError) throw dbError;

      // Send notification email to support@gocargologisticsus.com
      const pickupLocation = `${pickupAddress}, ${pickupCity}, ${pickupState} ${pickupZip}`;
      const deliveryLocation = `${deliveryAddress}, ${deliveryCity}, ${deliveryState} ${deliveryZip}`;
      const vehicleInfo = vehicleMake && vehicleModel ? `${vehicleYear} ${vehicleMake} ${vehicleModel}` : undefined;

      const emailResult = await sendQuoteRequestNotification({
        name,
        email,
        phone,
        pickupLocation,
        deliveryLocation,
        vehicleInfo,
        shipmentType: shipmentType || 'Vehicle Transport',
      });

      if (!emailResult.success) {
        console.error('Email notification failed:', emailResult.error);
      }

      toast({
        title: "Quote request submitted!",
        description: "We'll review your request and send you a quote within 24 hours.",
      });

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPickupAddress("");
      setPickupCity("");
      setPickupState("");
      setPickupZip("");
      setDeliveryAddress("");
      setDeliveryCity("");
      setDeliveryState("");
      setDeliveryZip("");
      setShipmentType("");
      setVehicleMake("");
      setVehicleModel("");
      setVehicleYear("");
      setNotes("");
    } catch (error: any) {
      console.error('Quote form error:', error);
      toast({
        title: "Failed to submit quote",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email">Email *</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="123 Main St, City, State ZIP"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery_address">Delivery Address *</Label>
                      <Textarea
                        id="delivery_address"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
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
                        value={shipmentType}
                        onValueChange={(value) => setShipmentType(value)}
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