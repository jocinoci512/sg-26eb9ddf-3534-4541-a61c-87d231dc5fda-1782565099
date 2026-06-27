import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Printer, TrendingUp, Package, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { printMonthlyReport } from "@/lib/pdfGenerator";
import type { MonthlyReportData } from "@/lib/pdfGenerator";

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    generateReport();
  }, [selectedMonth, selectedYear]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const monthIndex = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      // Get shipments for the selected month
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (shipmentsError) throw shipmentsError;

      const shipmentsList = shipments ?? [];
      
      // Calculate statistics
      const totalShipments = shipmentsList.length;
      const activeShipments = shipmentsList.filter(s => 
        ['pending_pickup', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)
      ).length;
      const deliveredShipments = shipmentsList.filter(s => s.status === 'delivered').length;
      const delayedShipments = shipmentsList.filter(s => s.status === 'delayed').length;
      const cancelledShipments = shipmentsList.filter(s => s.status === 'cancelled').length;

      // Calculate revenue (mock calculation - would be actual billing data)
      const revenue = totalShipments * 750; // Average shipment value

      // Top routes
      const routeMap = new Map<string, number>();
      shipmentsList.forEach(s => {
        const route = `${s.pickup_city}, ${s.pickup_state} → ${s.delivery_city}, ${s.delivery_state}`;
        routeMap.set(route, (routeMap.get(route) || 0) + 1);
      });
      const topRoutes = Array.from(routeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([route, count]) => ({ route, count }));

      // Shipment types
      const typeMap: Record<string, number> = {};
      shipmentsList.forEach(s => {
        typeMap[s.shipment_type] = (typeMap[s.shipment_type] || 0) + 1;
      });

      const report: MonthlyReportData = {
        month: months[monthIndex],
        year,
        totalShipments,
        activeShipments,
        deliveredShipments,
        delayedShipments,
        cancelledShipments,
        revenue,
        topRoutes,
        shipmentTypes: typeMap,
      };

      setReportData(report);
    } catch (error) {
      console.error('Generate report error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const stats = {
        month: new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' }),
        year: selectedYear.toString(),
        totalShipments: shipments?.length || 0,
        activeShipments: shipments?.filter(s => ['pending_pickup', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length || 0,
        deliveredShipments: shipments?.filter(s => s.status === 'delivered').length || 0,
        delayedShipments: shipments?.filter(s => s.status === 'delayed').length || 0,
        cancelledShipments: shipments?.filter(s => s.status === 'cancelled').length || 0,
      };

      // Calculate shipment types
      const typeCounts: Record<string, number> = {};
      shipments?.forEach(s => {
        const type = s.shipment_type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const shipmentTypes = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
      }));

      // Calculate top routes
      const routeCounts: Record<string, number> = {};
      shipments?.forEach(s => {
        if (s.pickup_city && s.delivery_city) {
          const route = `${s.pickup_city} → ${s.delivery_city}`;
          routeCounts[route] = (routeCounts[route] || 0) + 1;
        }
      });

      const topRoutes = Object.entries(routeCounts)
        .map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setMonthlyStats({ ...stats, shipmentTypes, topRoutes });
    } catch (error) {
      console.error('Error loading monthly stats:', error);
      toast({
        title: "Error loading stats",
        description: "Failed to load monthly statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    if (!reportData) return;
    printMonthlyReport(reportData);
    toast({
      title: "Report Generated",
      description: "Monthly report opened for printing",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export monthly performance reports</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handlePrintReport}
                  disabled={!reportData || loading}
                  className="w-full btn-gradient text-white"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating report...</p>
            </CardContent>
          </Card>
        ) : reportData ? (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Shipments
                  </CardTitle>
                  <Package className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reportData.totalShipments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.month} {reportData.year}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Delivered
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{reportData.deliveredShipments}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.totalShipments > 0 
                      ? `${Math.round((reportData.deliveredShipments / reportData.totalShipments) * 100)}% success rate`
                      : 'No data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue
                  </CardTitle>
                  <DollarSign className="w-5 h-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${reportData.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated total
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Shipping Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.topRoutes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No routes data</p>
                  ) : (
                    <div className="space-y-3">
                      {reportData.topRoutes.map((route, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">{route.route}</span>
                          <span className="text-sm font-bold text-primary">{route.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipment Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyStats.shipmentTypes && monthlyStats.shipmentTypes.length > 0 ? (
                      monthlyStats.shipmentTypes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="font-medium">{item.type}</span>
                          <span className="text-muted-foreground">{item.count} shipments</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}