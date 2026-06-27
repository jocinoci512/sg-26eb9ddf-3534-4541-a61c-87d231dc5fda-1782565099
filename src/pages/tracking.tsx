import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  Search, 
  Package, 
  MapPin, 
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Shipment = Database['public']['Tables']['shipments']['Row'];
type TrackingUpdate = Database['public']['Tables']['tracking_updates']['Row'];
type Vehicle = Database['public']['Tables']['vehicles']['Row'];

type ShipmentWithVehicle = Shipment & {
  vehicles?: Vehicle | null;
};

export default function TrackingPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<ShipmentWithVehicle | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (router.query.number) {
      setTrackingNumber(router.query.number as string);
      handleSearch(router.query.number as string);
    }
  }, [router.query.number]);

  const handleSearch = async (number?: string) => {
    const searchNumber = number || trackingNumber;
    if (!searchNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setShipment(null);
    setTrackingUpdates([]);

    try {
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            color
          )
        `)
        .eq('tracking_number', searchNumber.toUpperCase())
        .maybeSingle();

      if (shipmentError) throw shipmentError;

      if (!shipmentData) {
        setError("Tracking number not found. Please check and try again.");
        setLoading(false);
        return;
      }

      setShipment(shipmentData);

      const { data: updatesData, error: updatesError } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('created_at', { ascending: false });

      if (updatesError) throw updatesError;

      setTrackingUpdates(updatesData ?? []);
    } catch (err) {
      console.error('Tracking error:', err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'booked': 'bg-blue-500',
      'pending_pickup': 'bg-yellow-500',
      'picked_up': 'bg-orange-500',
      'processing': 'bg-purple-500',
      'loaded': 'bg-indigo-500',
      'in_transit': 'bg-blue-600',
      'distribution_center': 'bg-cyan-500',
      'customs_clearance': 'bg-amber-500',
      'out_for_delivery': 'bg-green-500',
      'delivered': 'bg-green-600',
      'completed': 'bg-emerald-600',
      'delayed': 'bg-red-500',
      'on_hold': 'bg-gray-500',
      'cancelled': 'bg-gray-600',
    };
    return statusMap[status] || 'bg-gray-500';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="hero-gradient text-white py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Shipment</h1>
            <p className="text-xl text-white/90 mb-8">
              Enter your tracking number to see real-time shipment status
            </p>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-2 bg-white rounded-lg p-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter tracking number (e.g., GCL123456789)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    className="pl-10 border-0 focus-visible:ring-0 h-12 text-foreground"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Track"}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-white">{error}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {shipment && (
        <section className="py-12 bg-muted/30">
          <div className="container max-w-5xl">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Tracking: {shipment.tracking_number}</CardTitle>
                    <Badge className={`${getStatusColor(shipment.status)} text-white`}>
                      {formatStatus(shipment.status)}
                    </Badge>
                  </div>
                  <Package className="w-12 h-12 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-muted-foreground mb-1">Pickup Location</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-foreground">
                          {shipment.pickup_address_line1}
                          {shipment.pickup_address_line2 && `, ${shipment.pickup_address_line2}`}
                          <br />
                          {shipment.pickup_city}, {shipment.pickup_state} {shipment.pickup_zip_code}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-muted-foreground mb-1">Delivery Location</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                        <p className="text-foreground">
                          {shipment.delivery_address_line1}
                          {shipment.delivery_address_line2 && `, ${shipment.delivery_address_line2}`}
                          <br />
                          {shipment.delivery_city}, {shipment.delivery_state} {shipment.delivery_zip_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {shipment.estimated_delivery_date && (
                      <div>
                        <h3 className="font-bold text-sm text-muted-foreground mb-1">Estimated Delivery</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <p className="text-foreground">
                            {new Date(shipment.estimated_delivery_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-muted-foreground mb-1">Shipment Type</h3>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-accent" />
                        <p className="text-foreground capitalize">{shipment.shipment_type?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {shipment.vehicles && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-bold mb-3">Vehicle Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Make</p>
                          <p className="font-medium">{shipment.vehicles.make}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Model</p>
                          <p className="font-medium">{shipment.vehicles.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-medium">{shipment.vehicles.year}</p>
                        </div>
                        {shipment.vehicles.color && (
                          <div>
                            <p className="text-sm text-muted-foreground">Color</p>
                            <p className="font-medium">{shipment.vehicles.color}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {trackingUpdates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingUpdates.map((update, index) => (
                      <div key={update.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-primary' : 'bg-muted'
                          }`}>
                            {index === 0 ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          {index < trackingUpdates.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold">{formatStatus(update.status)}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(update.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {update.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {update.location}
                            </p>
                          )}
                          {update.notes && (
                            <p className="text-sm mt-1">{update.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {!shipment && !loading && !error && (
        <section className="py-20 bg-white">
          <div className="container max-w-3xl text-center">
            <Package className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Track Your Shipment</h2>
            <p className="text-muted-foreground mb-8">
              Enter your tracking number above to see real-time updates on your shipment's journey.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <Search className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Enter Number</h3>
                  <p className="text-sm text-muted-foreground">
                    Input your tracking number
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Truck className="w-10 h-10 text-accent mx-auto mb-3" />
                  <h3 className="font-bold mb-2">View Status</h3>
                  <p className="text-sm text-muted-foreground">
                    See real-time updates
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your shipment
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}