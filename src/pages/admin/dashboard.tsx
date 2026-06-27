import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Stats = {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalCustomers: number;
  pendingQuotes: number;
  delayedShipments: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalShipments: 0,
    activeShipments: 0,
    deliveredShipments: 0,
    totalCustomers: 0,
    pendingQuotes: 0,
    delayedShipments: 0,
  });
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [shipmentsRes, customersRes, quotesRes, recentRes] = await Promise.all([
        supabase.from('shipments').select('id, status', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('quotes').select('id, status', { count: 'exact' }),
        supabase.from('shipments').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const shipments = shipmentsRes.data ?? [];
      const activeStatuses = ['pending_pickup', 'picked_up', 'in_transit', 'out_for_delivery'];
      
      setStats({
        totalShipments: shipmentsRes.count ?? 0,
        activeShipments: shipments.filter(s => activeStatuses.includes(s.status)).length,
        deliveredShipments: shipments.filter(s => s.status === 'delivered').length,
        totalCustomers: customersRes.count ?? 0,
        pendingQuotes: (quotesRes.data ?? []).filter(q => q.status === 'pending').length,
        delayedShipments: shipments.filter(s => s.status === 'delayed').length,
      });

      setRecentShipments(recentRes.data ?? []);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
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
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Shipments",
      value: stats.totalShipments,
      icon: Package,
      description: "All time shipments",
      color: "text-primary",
    },
    {
      title: "Active Shipments",
      value: stats.activeShipments,
      icon: Clock,
      description: "In progress",
      color: "text-accent",
    },
    {
      title: "Delivered",
      value: stats.deliveredShipments,
      icon: CheckCircle2,
      description: "Successfully completed",
      color: "text-green-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      description: "Registered users",
      color: "text-secondary",
    },
    {
      title: "Pending Quotes",
      value: stats.pendingQuotes,
      icon: TrendingUp,
      description: "Awaiting review",
      color: "text-orange-600",
    },
    {
      title: "Delayed",
      value: stats.delayedShipments,
      icon: AlertTriangle,
      description: "Requires attention",
      color: "text-destructive",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Monitor shipments, quotes, and customer activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentShipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No shipments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{shipment.tracking_number}</p>
                        <Badge variant={getStatusVariant(shipment.status)}>
                          {formatStatus(shipment.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {shipment.pickup_city}, {shipment.pickup_state} → {shipment.delivery_city}, {shipment.delivery_state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(shipment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}