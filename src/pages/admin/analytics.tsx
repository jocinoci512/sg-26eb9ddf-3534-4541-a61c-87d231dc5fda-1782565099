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
import { analyticsService } from "@/services/analyticsService";
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp, 
  Monitor, 
  Smartphone, 
  Tablet,
  BarChart3,
  Activity
} from "lucide-react";

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  deviceBreakdown: { mobile: number; tablet: number; desktop: number };
  trafficSources: Record<string, number>;
}

interface RealTimeStats {
  activeUsers: number;
  pageViewsLastHour: number;
  recentPages: Array<{ path: string; timestamp: string }>;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);

  useEffect(() => {
    loadAnalytics();
    loadRealTimeStats();

    // Refresh real-time stats every 30 seconds
    const interval = setInterval(loadRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const data = await analyticsService.getAnalyticsSummary(startDate, endDate);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      const stats = await analyticsService.getRealTimeStats();
      setRealTimeStats(stats);
    } catch (error) {
      console.error('Load real-time stats error:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Traffic Analytics</h1>
          <p className="text-muted-foreground">Track page visits, user behavior, and retention patterns</p>
        </div>

        {/* Real-time Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
              <Activity className="w-5 h-5 text-green-600 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{realTimeStats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Page Views (1h)
              </CardTitle>
              <Eye className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{realTimeStats?.pageViewsLastHour || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Period
              </CardTitle>
              <BarChart3 className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </CardContent>
          </Card>
        ) : analyticsData ? (
          <>
            {/* Overview Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Page Views
                  </CardTitle>
                  <Eye className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.totalPageViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last {period} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Unique Visitors
                  </CardTitle>
                  <Users className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analyticsData.uniqueVisitors > 0 
                      ? `${(analyticsData.totalPageViews / analyticsData.uniqueVisitors).toFixed(1)} pages/visitor`
                      : 'No data'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg. Session Duration
                  </CardTitle>
                  <Clock className="w-5 h-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatDuration(analyticsData.avgSessionDuration)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per session
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData.topPages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No page views yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.topPages.map((page, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{page.path}</p>
                            <p className="text-xs text-muted-foreground">
                              {((page.views / analyticsData.totalPageViews) * 100).toFixed(1)}% of total views
                            </p>
                          </div>
                          <span className="ml-4 text-lg font-bold text-primary">{page.views.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(analyticsData.trafficSources).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No traffic data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(analyticsData.trafficSources)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([source, count], index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium capitalize">{source}</span>
                            <span className="text-lg font-bold text-primary">{count.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analyticsData.deviceBreakdown.desktop}</p>
                      <p className="text-sm text-muted-foreground">Desktop</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analyticsData.deviceBreakdown.mobile}</p>
                      <p className="text-sm text-muted-foreground">Mobile</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Tablet className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analyticsData.deviceBreakdown.tablet}</p>
                      <p className="text-sm text-muted-foreground">Tablet</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Page Views */}
            {realTimeStats && realTimeStats.recentPages.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Recent Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {realTimeStats.recentPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                        <span className="font-medium">{page.path}</span>
                        <span className="text-muted-foreground">
                          {new Date(page.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No analytics data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}