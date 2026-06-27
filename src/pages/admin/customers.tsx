import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Mail, Phone, Package, FileText, Loader2, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CustomerWithStats = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  shipmentsCount: number;
  quotesCount: number;
};

export default function CustomersManagementPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customerShipments, setCustomerShipments] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      const customersWithStats = await Promise.all(
        (customersData ?? []).map(async (customer) => {
          const { count: shipmentsCount } = await supabase
            .from('shipments')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', customer.id);

          const { count: quotesCount } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('customer_email', customer.email);

          return {
            ...customer,
            shipmentsCount: shipmentsCount ?? 0,
            quotesCount: quotesCount ?? 0,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
    setLoadingDetails(true);

    try {
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setCustomerShipments(shipments ?? []);
    } catch (error) {
      console.error('Error loading customer details:', error);
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and view activity</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Customers Found</p>
                <p className="text-muted-foreground">
                  {customers.length === 0 ? "No registered customers yet" : "No customers match your search"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Shipments</TableHead>
                      <TableHead>Quotes</TableHead>
                      <TableHead>Member Since</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">{customer.full_name || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="font-semibold">{customer.shipmentsCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent" />
                            <span className="font-semibold">{customer.quotesCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(customer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(customer)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedCustomer.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                      {selectedCustomer.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedCustomer.phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">
                          {new Date(selectedCustomer.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-primary" />
                          <span className="font-medium">Total Shipments</span>
                        </div>
                        <span className="text-2xl font-bold">{selectedCustomer.shipmentsCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-accent" />
                          <span className="font-medium">Quote Requests</span>
                        </div>
                        <span className="text-2xl font-bold">{selectedCustomer.quotesCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Shipments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingDetails ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading shipments...</p>
                      </div>
                    ) : customerShipments.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No shipments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customerShipments.map((shipment) => (
                          <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <p className="font-mono font-semibold text-sm">{shipment.tracking_number}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {shipment.pickup_city}, {shipment.pickup_state} → {shipment.delivery_city}, {shipment.delivery_state}
                              </p>
                            </div>
                            <Badge variant={shipment.status === 'delivered' ? 'default' : 'outline'}>
                              {formatStatus(shipment.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}