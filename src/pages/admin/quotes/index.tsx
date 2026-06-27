import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, CheckCircle, XCircle, Package, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuotesManagementPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data ?? []);
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast({
        title: "Error",
        description: "Failed to load quotes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (quoteId: string) => {
    setActionLoading(quoteId);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'approved' })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote approved successfully",
      });
      loadQuotes();
    } catch (error) {
      console.error('Approve error:', error);
      toast({
        title: "Error",
        description: "Failed to approve quote",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (quoteId: string) => {
    setActionLoading(quoteId);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote rejected",
      });
      loadQuotes();
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: "Error",
        description: "Failed to reject quote",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertToShipment = async () => {
    if (!selectedQuote) return;
    
    setConverting(true);
    try {
      // First, get or create customer
      let customerId = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', selectedQuote.customer_email)
        .maybeSingle();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            email: selectedQuote.customer_email,
            full_name: selectedQuote.customer_name,
            phone: selectedQuote.customer_phone,
          }])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Create vehicle if applicable
      let vehicleId = null;
      if (selectedQuote.shipping_type === 'vehicle_transport' && selectedQuote.vehicle_make) {
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert([{
            make: selectedQuote.vehicle_make,
            model: selectedQuote.vehicle_model || '',
            year: selectedQuote.vehicle_year || new Date().getFullYear(),
          }])
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = vehicle.id;
      }

      // Create shipment
      const { error: shipmentError } = await supabase
        .from('shipments')
        .insert([{
          customer_id: customerId,
          vehicle_id: vehicleId,
          pickup_address_line1: selectedQuote.pickup_address,
          pickup_city: selectedQuote.pickup_city || '',
          pickup_state: selectedQuote.pickup_state || '',
          pickup_zip_code: selectedQuote.pickup_zip || '',
          delivery_address_line1: selectedQuote.delivery_address,
          delivery_city: selectedQuote.delivery_city || '',
          delivery_state: selectedQuote.delivery_state || '',
          delivery_zip_code: selectedQuote.delivery_zip || '',
          shipment_type: selectedQuote.shipping_type,
          status: 'booked',
          estimated_delivery_date: selectedQuote.preferred_pickup_date,
        }]);

      if (shipmentError) throw shipmentError;

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'converted' })
        .eq('id', selectedQuote.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Quote converted to shipment successfully",
      });
      
      setDialogOpen(false);
      setSelectedQuote(null);
      loadQuotes();
    } catch (error: any) {
      console.error('Convert error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert quote to shipment",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      'pending': { variant: 'outline', label: 'Pending' },
      'approved': { variant: 'default', label: 'Approved' },
      'rejected': { variant: 'destructive', label: 'Rejected' },
      'converted': { variant: 'secondary', label: 'Converted' },
    };
    const config = variants[status] || variants['pending'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quotes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quote Requests</h1>
          <p className="text-muted-foreground">Review and manage customer quote requests</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, email, quote number..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Quotes Found</p>
                <p className="text-muted-foreground">
                  {quotes.length === 0 ? "No quote requests yet" : "No quotes match your filters"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-mono font-medium">
                          {quote.quote_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{quote.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{quote.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{quote.pickup_address}</div>
                            <div className="text-muted-foreground text-xs">→ {quote.delivery_address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {quote.shipping_type?.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(quote.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(quote.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {quote.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(quote.id)}
                                  disabled={actionLoading === quote.id}
                                  className="text-green-600 hover:text-green-700 hover:border-green-600"
                                >
                                  {actionLoading === quote.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(quote.id)}
                                  disabled={actionLoading === quote.id}
                                  className="text-red-600 hover:text-red-700 hover:border-red-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {quote.status === 'approved' && (
                              <Dialog open={dialogOpen && selectedQuote?.id === quote.id} onOpenChange={(open) => {
                                setDialogOpen(open);
                                if (!open) setSelectedQuote(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="btn-gradient text-white"
                                    onClick={() => setSelectedQuote(quote)}
                                  >
                                    <Package className="w-4 h-4 mr-1" />
                                    Convert
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Convert Quote to Shipment</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Quote #</span>
                                        <span className="font-mono font-medium">{quote.quote_number}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Customer</span>
                                        <span className="font-medium">{quote.customer_name}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Type</span>
                                        <span className="capitalize">{quote.shipping_type?.replace('_', ' ')}</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      This will create a new shipment with status "Booked" and mark the quote as converted.
                                    </p>
                                    <div className="flex gap-3">
                                      <Button
                                        onClick={handleConvertToShipment}
                                        disabled={converting}
                                        className="flex-1 btn-gradient text-white"
                                      >
                                        {converting ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Converting...
                                          </>
                                        ) : (
                                          <>
                                            <Package className="w-4 h-4 mr-2" />
                                            Confirm Conversion
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setDialogOpen(false);
                                          setSelectedQuote(null);
                                        }}
                                        disabled={converting}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
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