import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QuotesManagementPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

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

  const handleStatusUpdate = async (quoteId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Quote ${newStatus} successfully`,
      });
      loadQuotes();
      setSelectedQuote(null);
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update quote status",
        variant: "destructive",
      });
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
      'converted': 'bg-blue-500',
    };
    return statusMap[status] || 'bg-gray-500';
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quote Requests</h1>
            <p className="text-muted-foreground">Review and manage customer quote requests</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by quote number, customer name, email..."
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
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading quotes...</p>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quotes found</p>
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
                          <div className="text-sm">
                            <div className="font-medium">{quote.customer_name}</div>
                            <div className="text-muted-foreground text-xs">{quote.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs">
                              {quote.pickup_address} → {quote.delivery_address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {quote.shipping_type?.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(quote.status)} text-white`}>
                            {formatStatus(quote.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(quote.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedQuote(quote)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {quote.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(quote.id, 'approved')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
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

      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>
              Quote #{selectedQuote?.quote_number}
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedQuote.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedQuote.customer_email}</p>
                  </div>
                  {selectedQuote.customer_phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedQuote.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Shipment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{selectedQuote.pickup_address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Location</p>
                    <p className="font-medium">{selectedQuote.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Type</p>
                    <p className="font-medium capitalize">{selectedQuote.shipping_type?.replace('_', ' ')}</p>
                  </div>
                  {selectedQuote.preferred_pickup_date && (
                    <div>
                      <p className="text-muted-foreground">Preferred Pickup</p>
                      <p className="font-medium">
                        {new Date(selectedQuote.preferred_pickup_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {(selectedQuote.vehicle_make || selectedQuote.vehicle_model) && (
                <div>
                  <h3 className="font-bold mb-3">Vehicle Information</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {selectedQuote.vehicle_year && (
                      <div>
                        <p className="text-muted-foreground">Year</p>
                        <p className="font-medium">{selectedQuote.vehicle_year}</p>
                      </div>
                    )}
                    {selectedQuote.vehicle_make && (
                      <div>
                        <p className="text-muted-foreground">Make</p>
                        <p className="font-medium">{selectedQuote.vehicle_make}</p>
                      </div>
                    )}
                    {selectedQuote.vehicle_model && (
                      <div>
                        <p className="text-muted-foreground">Model</p>
                        <p className="font-medium">{selectedQuote.vehicle_model}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedQuote.notes && (
                <div>
                  <h3 className="font-bold mb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedQuote.notes}</p>
                </div>
              )}

              {selectedQuote.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusUpdate(selectedQuote.id, 'approved')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Quote
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleStatusUpdate(selectedQuote.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Quote
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}