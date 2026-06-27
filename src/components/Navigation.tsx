import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Package, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Go Cargo Logistics</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            
            <div className="relative group">
              <button 
                className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                Services
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {servicesOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-border p-2"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link href="/services/vehicle-shipping" className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                    Vehicle Shipping
                  </Link>
                  <Link href="/services/freight" className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                    Freight Services
                  </Link>
                  <Link href="/services/international" className="block px-4 py-2 hover:bg-muted rounded-md transition-colors">
                    International Shipping
                  </Link>
                </div>
              )}
            </div>

            <Link href="/tracking" className="text-foreground hover:text-primary transition-colors font-medium">
              Track Shipment
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated && <NotificationBell />}
            <Link href="/portal/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/quote">
              <Button className="btn-gradient text-white">Get Quote</Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link href="/services/vehicle-shipping" className="text-foreground hover:text-primary transition-colors font-medium pl-4">
                Vehicle Shipping
              </Link>
              <Link href="/services/freight" className="text-foreground hover:text-primary transition-colors font-medium pl-4">
                Freight Services
              </Link>
              <Link href="/services/international" className="text-foreground hover:text-primary transition-colors font-medium pl-4">
                International Shipping
              </Link>
              <Link href="/tracking" className="text-foreground hover:text-primary transition-colors font-medium">
                Track Shipment
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition-colors font-medium">
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/portal/login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/quote">
                  <Button className="btn-gradient text-white w-full">Get Quote</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}