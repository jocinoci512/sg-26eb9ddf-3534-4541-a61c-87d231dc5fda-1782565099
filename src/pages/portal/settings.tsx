import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Mail, Bell, Smartphone, Loader2, Save } from "lucide-react";

interface UserSettings {
  email_notifications_enabled: boolean;
  email_shipment_created: boolean;
  email_shipment_picked_up: boolean;
  email_shipment_in_transit: boolean;
  email_shipment_delivered: boolean;
  email_shipment_delayed: boolean;
  email_quote_updates: boolean;
  dashboard_notifications_enabled: boolean;
  dashboard_shipment_updates: boolean;
  dashboard_quote_updates: boolean;
  dashboard_system_alerts: boolean;
  notification_frequency: string;
  sms_notifications_enabled: boolean;
  push_notifications_enabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications_enabled: true,
    email_shipment_created: true,
    email_shipment_picked_up: true,
    email_shipment_in_transit: true,
    email_shipment_delivered: true,
    email_shipment_delayed: true,
    email_quote_updates: true,
    dashboard_notifications_enabled: true,
    dashboard_shipment_updates: true,
    dashboard_quote_updates: true,
    dashboard_system_alerts: true,
    notification_frequency: 'instant',
    sms_notifications_enabled: false,
    push_notifications_enabled: false,
  });

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    }
  };

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as UserSettings);
      }
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your notification preferences have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
            <p className="text-muted-foreground">
              Manage how you receive updates about your shipments and quotes
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>Receive updates via email</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled" className="text-base font-semibold">
                    Enable Email Notifications
                  </Label>
                  <Switch
                    id="email-enabled"
                    checked={settings.email_notifications_enabled}
                    onCheckedChange={(checked) => updateSetting('email_notifications_enabled', checked)}
                  />
                </div>

                {settings.email_notifications_enabled && (
                  <>
                    <Separator />
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-created">Shipment Created</Label>
                        <Switch
                          id="email-created"
                          checked={settings.email_shipment_created}
                          onCheckedChange={(checked) => updateSetting('email_shipment_created', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-picked">Shipment Picked Up</Label>
                        <Switch
                          id="email-picked"
                          checked={settings.email_shipment_picked_up}
                          onCheckedChange={(checked) => updateSetting('email_shipment_picked_up', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-transit">In Transit Updates</Label>
                        <Switch
                          id="email-transit"
                          checked={settings.email_shipment_in_transit}
                          onCheckedChange={(checked) => updateSetting('email_shipment_in_transit', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-delivered">Delivery Confirmation</Label>
                        <Switch
                          id="email-delivered"
                          checked={settings.email_shipment_delivered}
                          onCheckedChange={(checked) => updateSetting('email_shipment_delivered', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-delayed">Delay Alerts</Label>
                        <Switch
                          id="email-delayed"
                          checked={settings.email_shipment_delayed}
                          onCheckedChange={(checked) => updateSetting('email_shipment_delayed', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-quotes">Quote Updates</Label>
                        <Switch
                          id="email-quotes"
                          checked={settings.email_quote_updates}
                          onCheckedChange={(checked) => updateSetting('email_quote_updates', checked)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Dashboard Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle>Dashboard Alerts</CardTitle>
                    <CardDescription>In-app notification preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dashboard-enabled" className="text-base font-semibold">
                    Enable Dashboard Notifications
                  </Label>
                  <Switch
                    id="dashboard-enabled"
                    checked={settings.dashboard_notifications_enabled}
                    onCheckedChange={(checked) => updateSetting('dashboard_notifications_enabled', checked)}
                  />
                </div>

                {settings.dashboard_notifications_enabled && (
                  <>
                    <Separator />
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dashboard-shipment">Shipment Updates</Label>
                        <Switch
                          id="dashboard-shipment"
                          checked={settings.dashboard_shipment_updates}
                          onCheckedChange={(checked) => updateSetting('dashboard_shipment_updates', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="dashboard-quotes">Quote Updates</Label>
                        <Switch
                          id="dashboard-quotes"
                          checked={settings.dashboard_quote_updates}
                          onCheckedChange={(checked) => updateSetting('dashboard_quote_updates', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="dashboard-system">System Alerts</Label>
                        <Switch
                          id="dashboard-system"
                          checked={settings.dashboard_system_alerts}
                          onCheckedChange={(checked) => updateSetting('dashboard_system_alerts', checked)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notification Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Frequency</CardTitle>
                <CardDescription>How often you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={settings.notification_frequency}
                  onValueChange={(value) => updateSetting('notification_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant (Real-time)</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Future Features */}
            <Card className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-muted-foreground">SMS & Push Notifications</CardTitle>
                    <CardDescription>Coming Soon</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 opacity-50">
                <div className="flex items-center justify-between">
                  <Label>SMS Notifications</Label>
                  <Switch disabled checked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Push Notifications</Label>
                  <Switch disabled checked={false} />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}