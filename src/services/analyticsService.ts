import { supabase } from "@/integrations/supabase/client";

/**
 * Analytics Service
 * Tracks page views, sessions, and user behavior
 */

interface PageViewData {
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  sessionId: string;
  userId?: string;
  customerId?: string;
}

interface SessionData {
  sessionId: string;
  userId?: string;
  customerId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number }>;
  deviceBreakdown: { mobile: number; tablet: number; desktop: number };
  trafficSources: Record<string, number>;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const storageKey = 'gc_session_id';
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detect browser
 */
function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
  return 'Other';
}

/**
 * Detect OS
 */
function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'MacOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iOS') > -1) return 'iOS';
  return 'Other';
}

/**
 * Parse UTM parameters from URL
 */
function parseUTM(): { source?: string; medium?: string; campaign?: string } {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
  };
}

/**
 * Check if user is returning
 */
async function isReturningUser(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('user_sessions')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  return !error && (data?.length ?? 0) > 0;
}

export const analyticsService = {
  /**
   * Track page view
   */
  async trackPageView(data: PageViewData) {
    try {
      const deviceType = detectDeviceType();
      const browser = detectBrowser();
      const os = detectOS();

      await supabase.from('page_views').insert({
        user_id: data.userId || null,
        customer_id: data.customerId || null,
        session_id: data.sessionId,
        page_path: data.pagePath,
        page_title: data.pageTitle || null,
        referrer: data.referrer || document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: deviceType,
        browser,
        os,
      });

      // Update session pages visited count
      const { data: session } = await supabase
        .from('user_sessions')
        .select('pages_visited')
        .eq('session_id', data.sessionId)
        .maybeSingle();

      if (session) {
        await supabase
          .from('user_sessions')
          .update({ 
            pages_visited: (session.pages_visited || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', data.sessionId);
      }

    } catch (error) {
      console.error('Track page view error:', error);
    }
  },

  /**
   * Start new session
   */
  async startSession(data: SessionData) {
    try {
      const sessionCreatedKey = `gc_session_created_${data.sessionId}`;
      
      // Client-side guard: check if we've already initiated session creation
      if (typeof window !== 'undefined') {
        const alreadyCreated = sessionStorage.getItem(sessionCreatedKey);
        if (alreadyCreated === 'true') {
          return; // Session creation already initiated
        }
        // Mark as initiated immediately to prevent race conditions
        sessionStorage.setItem(sessionCreatedKey, 'true');
      }

      // Check if session already exists in database
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', data.sessionId)
        .maybeSingle();

      // If session already exists, return early
      if (existingSession) {
        return;
      }

      const deviceType = detectDeviceType();
      const browser = detectBrowser();
      const os = detectOS();
      const utm = parseUTM();
      const isReturning = await isReturningUser(data.userId);

      const { error } = await supabase.from('user_sessions').insert({
        session_id: data.sessionId,
        user_id: data.userId || null,
        customer_id: data.customerId || null,
        referrer: data.referrer || document.referrer || null,
        utm_source: utm.source || data.utmSource || null,
        utm_medium: utm.medium || data.utmMedium || null,
        utm_campaign: utm.campaign || data.utmCampaign || null,
        device_type: deviceType,
        browser,
        os,
        is_returning_user: isReturning,
        pages_visited: 0,
      });

      if (error) {
        // If duplicate key error, silently ignore (session was created by another call)
        if (error.code === '23505') {
          console.log('Session already exists (handled duplicate)');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Start session error:', error);
      // Clear the guard flag on error so it can be retried
      if (typeof window !== 'undefined') {
        const sessionCreatedKey = `gc_session_created_${data.sessionId}`;
        sessionStorage.removeItem(sessionCreatedKey);
      }
    }
  },

  /**
   * End session
   */
  async endSession(sessionId: string) {
    try {
      const { data: session } = await supabase
        .from('user_sessions')
        .select('started_at')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (session) {
        const startedAt = new Date(session.started_at);
        const endedAt = new Date();
        const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000 / 60);

        await supabase
          .from('user_sessions')
          .update({
            ended_at: endedAt.toISOString(),
            duration_minutes: durationMinutes,
            updated_at: endedAt.toISOString(),
          })
          .eq('session_id', sessionId);
      }
    } catch (error) {
      console.error('End session error:', error);
    }
  },

  /**
   * Get session ID
   */
  getSessionId,

  /**
   * Get analytics summary for date range
   */
  async getAnalyticsSummary(startDate: Date, endDate: Date): Promise<AnalyticsSummary | null> {
    try {
      // Get page views
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!pageViews || !sessions) return null;

      // Calculate metrics
      const uniqueVisitors = new Set(pageViews.map(pv => pv.session_id)).size;
      const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length || 0;

      // Top pages
      const pageCount = pageViews.reduce((acc, pv) => {
        acc[pv.page_path] = (acc[pv.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPages = Object.entries(pageCount)
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Device breakdown
      const deviceBreakdown = pageViews.reduce((acc, pv) => {
        const type = pv.device_type || 'desktop';
        acc[type as keyof typeof acc] = (acc[type as keyof typeof acc] || 0) + 1;
        return acc;
      }, { mobile: 0, tablet: 0, desktop: 0 });

      // Traffic sources
      const trafficSources = sessions.reduce((acc, s) => {
        const source = s.utm_source || (s.referrer ? new URL(s.referrer).hostname : 'direct');
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalPageViews: pageViews.length,
        uniqueVisitors,
        avgSessionDuration,
        topPages,
        deviceBreakdown,
        trafficSources,
      };
    } catch (error) {
      console.error('Get analytics summary error:', error);
      return null;
    }
  },

  /**
   * Get real-time stats
   */
  async getRealTimeStats() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const { data: recentViews } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', oneHourAgo.toISOString())
        .order('created_at', { ascending: false });

      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('started_at', oneHourAgo.toISOString())
        .is('ended_at', null);

      return {
        activeUsers: activeSessions?.length || 0,
        pageViewsLastHour: recentViews?.length || 0,
        recentPages: recentViews?.slice(0, 10).map(v => ({
          path: v.page_path,
          timestamp: v.created_at,
        })) || [],
      };
    } catch (error) {
      console.error('Get real-time stats error:', error);
      return null;
    }
  },
};