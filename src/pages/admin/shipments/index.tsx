import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Package, Plus, Loader2, Eye, Edit, Trash2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { printShippingLabel } from "@/lib/pdfGenerator";
import type { ShippingLabelData } from "@/lib/pdfGenerator";

export default function ShipmentsManagementPage() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          vehicles (make, model, year),
          customers (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data ?? []);
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive",
      });
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

  const handlePrintLabel = (shipment: any) => {
    const labelData: ShippingLabelData = {
      trackingNumber: shipment.tracking_number,
      senderName: shipment.sender_name || 'Go Cargo Logistics',
      senderAddress: shipment.pickup_address_line1,
      senderCity: shipment.pickup_city,
      senderState: shipment.pickup_state,
      senderZip: shipment.pickup_zip_code,
      receiverName: shipment.receiver_name || shipment.customers?.full_name || 'Recipient',
      receiverAddress: shipment.delivery_address_line1,
      receiverCity: shipment.delivery_city,
      receiverState: shipment.delivery_state,
      receiverZip: shipment.delivery_zip_code,
      shipmentType: shipment.shipment_type,
      shipmentDate: new Date(shipment.created_at).toLocaleDateString(),
      estimatedDelivery: shipment.estimated_delivery_date 
        ? new Date(shipment.estimated_delivery_date).toLocaleDateString()
        : undefined,
      vehicleInfo: shipment.vehicles 
        ? `${shipment.vehicles.year} ${shipment.vehicles.make} ${shipment.vehicles.model}`
        : undefined,
    };

    printShippingLabel(labelData);
    
    toast({
      title: "Label Generated",
      description: "Shipping label opened in new window for printing",
    });
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customers?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.pickup_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.delivery_city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shipments...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shipments</h1>
            <p className="text-muted-foreground">Manage all shipments and track deliveries</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Shipment</DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Shipment creation form would go here with all required fields
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tracking #, customer, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="pending_pickup">Pending Pickup</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out For Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredShipments.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Shipments Found</p>
                <p className="text-muted-foreground mb-4">
                  {shipments.length === 0 ? "Create your first shipment to get started" : "No shipments match your filters"}
                </p>
                {shipments.length === 0 && (
                  <Button onClick={() => setDialogOpen(true)} className="btn-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Shipment
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono font-medium">
                          {shipment.tracking_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{shipment.customers?.full_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{shipment.customers?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{shipment.pickup_city}, {shipment.pickup_state}</div>
                            <div className="text-muted-foreground">→ {shipment.delivery_city}, {shipment.delivery_state}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {shipment.vehicles ? (
                            <div className="text-sm">
                              {shipment.vehicles.year} {shipment.vehicles.make} {shipment.vehicles.model}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(shipment.status)}>
                            {formatStatus(shipment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintLabel(shipment)}
                              title="Print Shipping Label"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}