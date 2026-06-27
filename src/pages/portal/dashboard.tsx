import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  LogOut,
  User,
  FileText
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import Link from "next/link";

type Shipment = Database['public']['Tables']['shipments']['Row'];

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await authService.getCurrentUser();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', currentUser.id)
      .single();

    if (customerData) {
      setCustomer(customerData);

      const { data: shipmentsData } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_id', customerData.id)
        .order('created_at', { ascending: false });

      if (shipmentsData) {
        setShipments(shipmentsData);
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'in_transit': 'bg-blue-500',
      'delivered': 'bg-green-500',
      'pending_pickup': 'bg-yellow-500',
      'on_hold': 'bg-gray-500',
    };
    return statusMap[status] || 'bg-blue-500';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeShipments = shipments.filter(s => 
    !['delivered', 'completed', 'cancelled'].includes(s.status)
  );
  const deliveredShipments = shipments.filter(s => 
    ['delivered', 'completed'].includes(s.status)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-br from-primary to-accent text-white py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {customer?.full_name || 'Customer'}</h1>
              <p className="text-white/80">Manage your shipments and account</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Shipments</p>
                    <p className="text-3xl font-bold">{shipments.length}</p>
                  </div>
                  <Package className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-3xl font-bold">{activeShipments.length}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">In Transit</p>
                    <p className="text-3xl font-bold">
                      {shipments.filter(s => s.status === 'in_transit').length}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivered</p>
                    <p className="text-3xl font-bold">{deliveredShipments.length}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  {shipments.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No shipments yet</p>
                      <Link href="/quote">
                        <Button>Request a Quote</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shipments.slice(0, 5).map((shipment) => (
                        <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold">{shipment.tracking_number}</h3>
                              <Badge className={`${getStatusColor(shipment.status)} text-white`}>
                                {formatStatus(shipment.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {shipment.pickup_city}, {shipment.pickup_state} → {shipment.delivery_city}, {shipment.delivery_state}
                            </p>
                          </div>
                          <Link href={`/tracking?number=${shipment.tracking_number}`}>
                            <Button variant="outline" size="sm">
                              Track
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{customer?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer?.email}</p>
                  </div>
                  {customer?.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/quote" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Request New Quote
                    </Button>
                  </Link>
                  <Link href="/tracking" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Track Shipment
                    </Button>
                  </Link>
                  <Link href="/contact" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Contact Support
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}