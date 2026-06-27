import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  FileText, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    pendingQuotes: 0,
    totalCustomers: 0,
    inTransit: 0,
    delivered: 0,
  });
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: shipments } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: quotes } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: customers } = await supabase
      .from('customers')
      .select('id');

    if (shipments) {
      setStats(prev => ({
        ...prev,
        totalShipments: shipments.length,
        activeShipments: shipments.filter(s => 
          !['delivered', 'completed', 'cancelled'].includes(s.status)
        ).length,
        inTransit: shipments.filter(s => s.status === 'in_transit').length,
        delivered: shipments.filter(s => 
          ['delivered', 'completed'].includes(s.status)
        ).length,
      }));
      setRecentShipments(shipments.slice(0, 5));
    }

    if (quotes) {
      setStats(prev => ({
        ...prev,
        pendingQuotes: quotes.filter(q => q.status === 'pending').length,
      }));
      setRecentQuotes(quotes.slice(0, 5));
    }

    if (customers) {
      setStats(prev => ({
        ...prev,
        totalCustomers: customers.length,
      }));
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'bg-yellow-500',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500',
      'in_transit': 'bg-blue-500',
      'delivered': 'bg-green-600',
    };
    return statusMap[status] || 'bg-gray-500';
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your logistics operations</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Shipments</p>
                  <p className="text-3xl font-bold">{stats.totalShipments}</p>
                </div>
                <Package className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Shipments</p>
                  <p className="text-3xl font-bold">{stats.activeShipments}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Quotes</p>
                  <p className="text-3xl font-bold">{stats.pendingQuotes}</p>
                </div>
                <FileText className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-3xl font-bold">{stats.totalCustomers}</p>
                </div>
                <Users className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">In Transit</p>
                  <p className="text-2xl font-bold">{stats.inTransit}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivered</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">On-Time Rate</p>
                  <p className="text-2xl font-bold">98%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Revenue (MTD)</p>
                  <p className="text-2xl font-bold">$45.2K</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Shipments</CardTitle>
                <Link href="/admin/shipments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentShipments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shipments yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentShipments.map((shipment) => (
                    <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">{shipment.tracking_number}</p>
                          <Badge className={`${getStatusColor(shipment.status)} text-white text-xs`}>
                            {formatStatus(shipment.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {shipment.pickup_city}, {shipment.pickup_state} → {shipment.delivery_city}, {shipment.delivery_state}
                        </p>
                      </div>
                      <Link href={`/admin/shipments/${shipment.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Quote Requests</CardTitle>
                <Link href="/admin/quotes">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentQuotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No quotes yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm">{quote.quote_number}</p>
                          <Badge className={`${getStatusColor(quote.status)} text-white text-xs`}>
                            {formatStatus(quote.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {quote.customer_name} • {quote.shipping_type?.replace('_', ' ')}
                        </p>
                      </div>
                      <Link href={`/admin/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm">Review</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}