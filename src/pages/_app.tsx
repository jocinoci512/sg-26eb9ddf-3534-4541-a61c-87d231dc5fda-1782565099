import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { analyticsService } from "@/services/analyticsService";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Initialize session on app load
    const initializeSession = async () => {
      const sessionId = analyticsService.getSessionId();
      const { data: { user } } = await supabase.auth.getUser();
      
      let customerId = null;
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        customerId = customer?.id;
      }

      // Start session
      await analyticsService.startSession({
        sessionId,
        userId: user?.id,
        customerId: customerId || undefined,
      });

      // Track initial page view
      await analyticsService.trackPageView({
        pagePath: router.pathname,
        pageTitle: document.title,
        sessionId,
        userId: user?.id,
        customerId: customerId || undefined,
      });
    };

    initializeSession();

    // Track page views on route change
    const handleRouteChange = async (url: string) => {
      const sessionId = analyticsService.getSessionId();
      const { data: { user } } = await supabase.auth.getUser();
      
      let customerId = null;
      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        customerId = customer?.id;
      }

      await analyticsService.trackPageView({
        pagePath: url,
        pageTitle: document.title,
        sessionId,
        userId: user?.id,
        customerId: customerId || undefined,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // End session on page unload
    const handleUnload = () => {
      const sessionId = analyticsService.getSessionId();
      analyticsService.endSession(sessionId);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.addEventListener('beforeunload', handleUnload);
    };
  }, [router]);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}
