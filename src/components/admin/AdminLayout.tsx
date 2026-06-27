import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
      return;
    }

    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!staffData) {
      await supabase.auth.signOut();
      router.push('/admin/login');
      return;
    }

    setStaff(staffData);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', href: '/admin/shipments', icon: Package },
    { name: 'Quotes', href: '/admin/quotes', icon: FileText },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl">Admin Portal</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:block fixed top-0 left-64 right-0 bg-white border-b z-40 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <NotificationBell />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className={`
          fixed md:sticky top-0 left-0 h-screen admin-sidebar w-64 z-40
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold text-white">Go Cargo Admin</h1>
            <p className="text-sm text-white/80 mt-1">
              {staff?.full_name}
            </p>
            <p className="text-xs text-white/60 capitalize">
              {staff?.role?.replace('_', ' ')}
            </p>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </aside>

        <main className="flex-1 pt-16 md:pt-0">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}