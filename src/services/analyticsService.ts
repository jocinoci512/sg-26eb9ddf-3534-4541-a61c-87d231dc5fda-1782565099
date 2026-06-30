/**
 * Analytics Service
 * Provides data aggregation and analysis for admin dashboard
 */

import { supabase } from "@/integrations/supabase/client";

export interface ShipmentTrend {
  date: string;
  total: number;
  delivered: number;
  in_transit: number;
  delayed: number;
}

export interface DelayStatistics {
  totalDelayed: number;
  averageDelayHours: number;
  delayRate: number;
  delaysByReason: { reason: string; count: number }[];
}

export interface PerformanceMetrics {
  onTimeDeliveryRate: number;
  totalShipments: number;
  completedShipments: number;
  activeShipments: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  averageShipmentValue: number;
  revenueByMonth: { month: string; revenue: number }[];
}

export interface GeographicData {
  state: string;
  shipmentCount: number;
  revenue: number;
}

/**
 * Get shipment trends over time
 */
export async function getShipmentTrends(
  startDate: Date,
  endDate: Date
): Promise<ShipmentTrend[]> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const trendMap = new Map<string, ShipmentTrend>();

    data?.forEach((shipment) => {
      const date = new Date(shipment.created_at).toISOString().split('T')[0];
      
      if (!trendMap.has(date)) {
        trendMap.set(date, {
          date,
          total: 0,
          delivered: 0,
          in_transit: 0,
          delayed: 0,
        });
      }

      const trend = trendMap.get(date)!;
      trend.total++;

      if (shipment.status === 'delivered') trend.delivered++;
      if (shipment.status === 'in_transit') trend.in_transit++;
      if (shipment.status === 'delayed') trend.delayed++;
    });

    return Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Get shipment trends error:', error);
    return [];
  }
}

/**
 * Get delay statistics
 */
export async function getDelayStatistics(): Promise<DelayStatistics> {
  try {
    const { data: allShipments, error: allError } = await supabase
      .from('shipments')
      .select('id')
      .in('status', ['delivered', 'in_transit', 'delayed', 'out_for_delivery']);

    const { data: delayedShipments, error: delayError } = await supabase
      .from('shipments')
      .select('delay_duration_hours, delay_reason')
      .eq('is_delayed', true);

    if (allError || delayError) throw allError || delayError;

    const totalShipments = allShipments?.length || 0;
    const totalDelayed = delayedShipments?.length || 0;
    const delayRate = totalShipments > 0 ? (totalDelayed / totalShipments) * 100 : 0;

    // Calculate average delay hours
    const totalDelayHours = delayedShipments?.reduce(
      (sum, s) => sum + (s.delay_duration_hours || 0),
      0
    ) || 0;
    const averageDelayHours = totalDelayed > 0 ? totalDelayHours / totalDelayed : 0;

    // Group delays by reason
    const reasonMap = new Map<string, number>();
    delayedShipments?.forEach((shipment) => {
      const reason = shipment.delay_reason || 'Unknown';
      reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
    });

    const delaysByReason = Array.from(reasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalDelayed,
      averageDelayHours: Math.round(averageDelayHours * 10) / 10,
      delayRate: Math.round(delayRate * 10) / 10,
      delaysByReason,
    };
  } catch (error) {
    console.error('Get delay statistics error:', error);
    return {
      totalDelayed: 0,
      averageDelayHours: 0,
      delayRate: 0,
      delaysByReason: [],
    };
  }
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  try {
    const { data: allShipments, error } = await supabase
      .from('shipments')
      .select('status, estimated_delivery_date, actual_delivery_date, created_at');

    if (error) throw error;

    const total = allShipments?.length || 0;
    const completed = allShipments?.filter(s => s.status === 'delivered').length || 0;
    const active = allShipments?.filter(s => 
      ['in_transit', 'out_for_delivery', 'picked_up'].includes(s.status)
    ).length || 0;

    // Calculate on-time delivery rate
    const deliveredShipments = allShipments?.filter(s => s.status === 'delivered') || [];
    const onTimeDeliveries = deliveredShipments.filter(s => {
      if (!s.actual_delivery_date || !s.estimated_delivery_date) return false;
      return new Date(s.actual_delivery_date) <= new Date(s.estimated_delivery_date);
    }).length;

    const onTimeRate = deliveredShipments.length > 0
      ? (onTimeDeliveries / deliveredShipments.length) * 100
      : 0;

    // Calculate average delivery time
    const deliveryTimes = deliveredShipments
      .filter(s => s.created_at && s.actual_delivery_date)
      .map(s => {
        const start = new Date(s.created_at).getTime();
        const end = new Date(s.actual_delivery_date!).getTime();
        return (end - start) / (1000 * 60 * 60 * 24); // Convert to days
      });

    const averageDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0;

    return {
      onTimeDeliveryRate: Math.round(onTimeRate * 10) / 10,
      totalShipments: total,
      completedShipments: completed,
      activeShipments: active,
      averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
      customerSatisfaction: 98.5, // TODO: Calculate from feedback/ratings when available
    };
  } catch (error) {
    console.error('Get performance metrics error:', error);
    return {
      onTimeDeliveryRate: 0,
      totalShipments: 0,
      completedShipments: 0,
      activeShipments: 0,
      averageDeliveryTime: 0,
      customerSatisfaction: 0,
    };
  }
}

/**
 * Get revenue metrics
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  try {
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('shipping_cost, created_at, status')
      .not('shipping_cost', 'is', null);

    if (error) throw error;

    const totalRevenue = shipments?.reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0;

    // Calculate monthly revenue
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = shipments
      ?.filter(s => new Date(s.created_at) >= firstDayOfMonth)
      .reduce((sum, s) => sum + (s.shipping_cost || 0), 0) || 0;

    const averageShipmentValue = shipments && shipments.length > 0
      ? totalRevenue / shipments.length
      : 0;

    // Group revenue by month
    const monthMap = new Map<string, number>();
    shipments?.forEach(s => {
      const date = new Date(s.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + (s.shipping_cost || 0));
    });

    const revenueByMonth = Array.from(monthMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      averageShipmentValue: Math.round(averageShipmentValue * 100) / 100,
      revenueByMonth,
    };
  } catch (error) {
    console.error('Get revenue metrics error:', error);
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageShipmentValue: 0,
      revenueByMonth: [],
    };
  }
}

/**
 * Get geographic distribution data
 */
export async function getGeographicData(): Promise<GeographicData[]> {
  try {
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select('pickup_state, delivery_state, shipping_cost');

    if (error) throw error;

    const stateMap = new Map<string, GeographicData>();

    shipments?.forEach(s => {
      // Count pickup state
      if (s.pickup_state) {
        if (!stateMap.has(s.pickup_state)) {
          stateMap.set(s.pickup_state, {
            state: s.pickup_state,
            shipmentCount: 0,
            revenue: 0,
          });
        }
        const data = stateMap.get(s.pickup_state)!;
        data.shipmentCount++;
        data.revenue += s.shipping_cost || 0;
      }

      // Count delivery state
      if (s.delivery_state && s.delivery_state !== s.pickup_state) {
        if (!stateMap.has(s.delivery_state)) {
          stateMap.set(s.delivery_state, {
            state: s.delivery_state,
            shipmentCount: 0,
            revenue: 0,
          });
        }
        const data = stateMap.get(s.delivery_state)!;
        data.shipmentCount++;
      }
    });

    return Array.from(stateMap.values()).sort((a, b) => b.shipmentCount - a.shipmentCount);
  } catch (error) {
    console.error('Get geographic data error:', error);
    return [];
  }
}