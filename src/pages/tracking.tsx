import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShipmentMap } from "@/components/ShipmentMap";
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
  Download,
  Loader2,
  AlertCircle,
  Mail,
  Bell,
  Printer,
  File,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { generateShipmentPDF } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";

type Shipment = Database['public']['Tables']['shipments']['Row'];
type TrackingUpdate = Database['public']['Tables']['tracking_updates']['Row'];
type Vehicle = Database['public']['Tables']['vehicles']['Row'];

type PartialVehicle = Pick<Vehicle, 'make' | 'model' | 'year' | 'color'>;

type ShipmentWithVehicle = Shipment & {
  vehicles?: PartialVehicle | null;
};

export default function TrackingPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState<ShipmentWithVehicle | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [shipmentEvents, setShipmentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

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

      // Load shipment events (audit trail)
      const { data: eventsData, error: eventsError } = await supabase
        .from('shipment_events')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      setShipmentEvents(eventsData ?? []);

      // Check if user is subscribed
      if (shipmentData) {
        const userEmail = localStorage.getItem(`tracking_email_${shipmentData.id}`);
        setIsSubscribed(!!userEmail);
        if (userEmail) {
          setSubscribeEmail(userEmail);
        }

        // Load documents
        const { data: docsData } = await supabase
          .from('documents')
          .select('*')
          .eq('shipment_id', shipmentData.id)
          .order('created_at', { ascending: false });
        
        setDocuments(docsData ?? []);
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!subscribeEmail.trim() || !shipment) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setSubscribing(true);

    try {
      // Store subscription in database
      const { error: subError } = await supabase
        .from('email_subscriptions')
        .upsert({
          shipment_id: shipment.id,
          email: subscribeEmail.toLowerCase(),
          is_active: true
        }, {
          onConflict: 'shipment_id,email'
        });

      if (subError) throw subError;

      // Store in localStorage for this session
      localStorage.setItem(`tracking_email_${shipment.id}`, subscribeEmail);
      setIsSubscribed(true);

      toast({
        title: "Subscribed Successfully! ✅",
        description: "You'll receive email updates about this shipment",
      });
    } catch (err) {
      console.error('Subscription error:', err);
      toast({
        title: "Subscription Failed",
        description: "Could not subscribe to updates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!shipment) return;

    setDownloadingPDF(true);
    try {
      await generateShipmentPDF(shipment, trackingUpdates);
      toast({
        title: "PDF Generated! ✅",
        description: "Your shipment details have been downloaded",
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      'bill_of_lading': FileText,
      'invoice': File,
      'insurance': FileText,
      'label': FileText,
      'other': File
    };
    return iconMap[type] || File;
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return CheckCircle2;
    if (status.includes('transit') || status.includes('delivery')) return Truck;
    return Clock;
  };

  const getStatusColor = (status: string) => {
    if (status === 'delivered') return 'text-green-600';
    if (status === 'delayed' || status === 'cancelled') return 'text-red-600';
    if (status.includes('transit')) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="py-16 hero-gradient text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Package className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Shipment</h1>
            <p className="text-lg text-white/90 mb-8">
              Enter your tracking number to get real-time shipment updates
            </p>

            <div className="flex gap-3">
              <Input
                placeholder="Enter tracking number (e.g., GCL-2026-XXXX)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-12 bg-white text-foreground placeholder:text-muted-foreground"
                disabled={loading}
              />
              <Button
                onClick={() => handleSearch()}
                disabled={loading}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-left backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {shipment && (
        <section className="py-12 bg-muted/30">
          <div className="container max-w-6xl space-y-8 animate-fade-up">
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">Tracking Details</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-primary">
                        {shipment.tracking_number}
                      </span>
                      <Badge className={`${getStatusColor(shipment.status)} bg-transparent border-current`}>
                        {formatStatus(shipment.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePrint}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                    >
                      {downloadingPDF ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-muted-foreground mb-2">Pickup Location</h3>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {shipment.pickup_address_line1}
                            {shipment.pickup_address_line2 && `, ${shipment.pickup_address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.pickup_city}, {shipment.pickup_state} {shipment.pickup_zip_code}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-muted-foreground mb-2">Delivery Location</h3>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">
                            {shipment.delivery_address_line1}
                            {shipment.delivery_address_line2 && `, ${shipment.delivery_address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.delivery_city}, {shipment.delivery_state} {shipment.delivery_zip_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {shipment.estimated_delivery_date && (
                      <div>
                        <h3 className="font-bold text-sm text-muted-foreground mb-2">Estimated Delivery</h3>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <p className="font-medium">
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
                      <h3 className="font-bold text-sm text-muted-foreground mb-2">Shipment Type</h3>
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-accent" />
                        <p className="font-medium capitalize">{shipment.shipment_type?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {shipment.vehicles && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="font-bold text-lg mb-4">Vehicle Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Make</p>
                          <p className="font-semibold">{shipment.vehicles.make}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Model</p>
                          <p className="font-semibold">{shipment.vehicles.model}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Year</p>
                          <p className="font-semibold">{shipment.vehicles.year}</p>
                        </div>
                        {shipment.vehicles.color && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Color</p>
                            <p className="font-semibold">{shipment.vehicles.color}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Email Subscription Card */}
            <Card className="animate-fade-up [animation-delay:50ms] border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  Get Email Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubscribed ? (
                  <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">You're subscribed!</p>
                      <p className="text-sm text-green-700">
                        Updates will be sent to: <span className="font-medium">{subscribeEmail}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Enter your email to receive automatic notifications about this shipment's status changes.
                    </p>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                        className="flex-1"
                        disabled={subscribing}
                      />
                      <Button
                        onClick={handleSubscribe}
                        disabled={subscribing}
                        className="px-6"
                      >
                        {subscribing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Subscribe
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You'll receive emails when your shipment is picked up, in transit, out for delivery, and delivered.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Card */}
            {documents.length > 0 && (
              <Card className="animate-fade-up [animation-delay:100ms]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Shipment Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {documents.map((doc) => {
                      const DocIcon = getDocumentIcon(doc.document_type);
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <DocIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{doc.file_name || formatStatus(doc.document_type)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real-Time Tracking Map */}
            <div className="animate-fade-up [animation-delay:100ms]">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Live GPS Tracking
              </h2>
              <ShipmentMap
                pickupCity={shipment.pickup_city}
                pickupState={shipment.pickup_state}
                deliveryCity={shipment.delivery_city}
                deliveryState={shipment.delivery_state}
                currentStatus={shipment.status}
                shipmentType={shipment.shipment_type}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Shipment Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackingUpdates.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No tracking updates yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {trackingUpdates.map((update, index) => {
                      const StatusIcon = getStatusIcon(update.status);
                      const isLatest = index === 0;
                      return (
                        <div key={update.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                              ${isLatest 
                                ? 'bg-gradient-to-br from-primary to-primary/80 text-white ring-4 ring-primary/20' 
                                : 'bg-muted text-muted-foreground'
                              }
                            `}>
                              <StatusIcon className="w-6 h-6" />
                            </div>
                            {index < trackingUpdates.length - 1 && (
                              <div className={`w-0.5 h-full min-h-12 mt-2 ${
                                isLatest ? 'bg-primary/30' : 'bg-border'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                              <h4 className={`font-bold text-lg ${isLatest ? 'text-primary' : ''}`}>
                                {formatStatus(update.status)}
                              </h4>
                              <span className="text-sm text-muted-foreground font-medium">
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
                              <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4" />
                                {update.location}
                              </p>
                            )}
                            {update.notes && (
                              <p className="text-sm bg-muted/50 p-3 rounded-lg border">{update.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipment Event History */}
            {shipmentEvents.length > 0 && (
              <Card className="animate-fade-up [animation-delay:200ms]">
                <CardHeader>
                  <CardTitle>Event History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {shipmentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{event.event_description}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(event.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {event.performed_by_name && (
                            <p className="text-xs text-muted-foreground">
                              by {event.performed_by_name}
                              {event.performed_by_role && ` (${event.performed_by_role.replace('_', ' ')})`}
                            </p>
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

      <Footer />
    </div>
  );
}