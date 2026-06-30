import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  getShipmentTrends,
  getDelayStatistics,
  getPerformanceMetrics,
  getRevenueMetrics,
  getGeographicData,
  type ShipmentTrend,
  type DelayStatistics,
  type PerformanceMetrics,
  type RevenueMetrics,
  type GeographicData,
} from "@/services/analyticsService";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Package,
  Clock,
  Award,
  MapPin,
  Loader2,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<ShipmentTrend[]>([]);
  const [delayStats, setDelayStats] = useState<DelayStatistics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [geoData, setGeoData] = useState<GeographicData[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const [trendsData, delayData, perfData, revData, geoDataResult] = await Promise.all([
        getShipmentTrends(startDate, endDate),
        getDelayStatistics(),
        getPerformanceMetrics(),
        getRevenueMetrics(),
        getGeographicData(),
      ]);

      setTrends(trendsData);
      setDelayStats(delayData);
      setPerformance(perfData);
      setRevenue(revData);
      setGeoData(geoDataResult);
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
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
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive shipment performance and business metrics</p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Performance Metrics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Shipments
              </CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.totalShipments || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {performance?.activeShipments || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                On-Time Delivery
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.onTimeDeliveryRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {performance?.completedShipments || 0} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Delivery Time
              </CardTitle>
              <Clock className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.averageDeliveryTime || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customer Satisfaction
              </CardTitle>
              <Award className="w-5 h-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.customerSatisfaction || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(revenue?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(revenue?.monthlyRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Shipment Value
              </CardTitle>
              <Package className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(revenue?.averageShipmentValue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">per shipment</p>
            </CardContent>
          </Card>
        </div>

        {/* Delay Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Delay Statistics</CardTitle>
              <Badge variant={delayStats && delayStats.delayRate > 5 ? "destructive" : "secondary"}>
                {delayStats?.delayRate || 0}% delay rate
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{delayStats?.totalDelayed || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Delayed</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{delayStats?.averageDelayHours || 0}h</p>
                  <p className="text-sm text-muted-foreground">Avg. Delay Duration</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{delayStats?.delayRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Delay Rate</p>
                </div>
              </div>
            </div>

            {delayStats && delayStats.delaysByReason.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Delays by Reason</h3>
                <div className="space-y-2">
                  {delayStats.delaysByReason.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{item.reason}</span>
                      <Badge variant="outline">{item.count} shipments</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Shipment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trend data available</p>
              ) : (
                <div className="space-y-3">
                  {trends.slice(-10).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {trend.delivered} delivered, {trend.in_transit} in transit
                        </p>
                      </div>
                      <Badge variant="secondary">{trend.total} total</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Month */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {!revenue || revenue.revenueByMonth.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No revenue data available</p>
              ) : (
                <div className="space-y-3">
                  {revenue.revenueByMonth.slice(-10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{item.month}</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {geoData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No geographic data available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geoData.slice(0, 15).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {item.state}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.shipmentCount}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}