import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Package, Clock, CheckCircle2, User, Mail, Phone, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (customerError) throw customerError;

      if (!customerData) {
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert([
            {
              user_id: authUser.id,
              email: authUser.email!,
              full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setCustomer(newCustomer);
        await loadShipments(newCustomer.id);
      } else {
        setCustomer(customerData);
        await loadShipments(customerData.id);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError("Failed to load account information");
    } finally {
      setLoading(false);
    }
  };

  const loadShipments = async (customerId: string) => {
    try {
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (shipmentsError) throw shipmentsError;

      const shipmentsList = shipmentsData ?? [];
      setShipments(shipmentsList);

      const activeStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'out_for_delivery'];
      setStats({
        total: shipmentsList.length,
        active: shipmentsList.filter(s => activeStatuses.includes(s.status)).length,
        delivered: shipmentsList.filter(s => s.status === 'delivered').length,
      });
    } catch (err: any) {
      console.error('Shipments error:', err);
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'delivered') return 'default';
    if (status === 'delayed' || status === 'cancelled') return 'destructive';
    if (status === 'in_transit') return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/login')}>Back to Login</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="flex-1 py-12 bg-muted/30">
        <div className="container space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {customer?.full_name}</h1>
            <p className="text-muted-foreground">
              Manage your shipments and track deliveries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Shipments
                </CardTitle>
                <Package className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active
                </CardTitle>
                <Clock className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Delivered
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.delivered}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Shipments</CardTitle>
              </CardHeader>
              <CardContent>
                {shipments.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No Shipments Yet</p>
                    <p className="text-muted-foreground mb-4">
                      Request a quote to get started
                    </p>
                    <Button asChild className="btn-gradient text-white">
                      <Link href="/quote">Get a Quote</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{shipment.tracking_number}</p>
                            <Badge variant={getStatusVariant(shipment.status)}>
                              {formatStatus(shipment.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {shipment.pickup_city}, {shipment.pickup_state} → {shipment.delivery_city}, {shipment.delivery_state}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/tracking?number=${shipment.tracking_number}`}>
                            Track
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{customer?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer?.email}</p>
                  </div>
                </div>
                {customer?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}