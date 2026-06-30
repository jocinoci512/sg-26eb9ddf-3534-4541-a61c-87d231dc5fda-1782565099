import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  geocodeAddress,
  calculateTruckRoute,
  calculatePositionOnRoute,
  formatDistance,
  formatDuration,
  type HERECoordinates,
  type HERERouteData,
} from '@/services/hereMapsService';
import { getMapStyleUrl, routeLineStyle } from '@/lib/mapStyles';

interface ShipmentMapProps {
  shipmentId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  currentStatus: string;
  shipmentType?: string;
  estimatedDelivery?: string;
}

// Geocoding cache to avoid repeat API calls
const geocodingCache = new Map<string, HERECoordinates>();

export function ShipmentMap({
  shipmentId,
  pickupAddress,
  deliveryAddress,
  currentStatus,
  shipmentType = 'vehicle',
}: ShipmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const deliveryMarker = useRef<mapboxgl.Marker | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);

  const [pickupCoords, setPickupCoords] = useState<HERECoordinates | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<HERECoordinates | null>(null);
  const [routeData, setRouteData] = useState<HERERouteData | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingStates, setLoadingStates] = useState({
    map: true,
    geocoding: true,
    routing: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Calculate progress from status
  const calculateProgressFromStatus = useCallback((status: string): number => {
    const statusProgress: Record<string, number> = {
      'booked': 0,
      'pending_pickup': 5,
      'picked_up': 15,
      'processing': 20,
      'loaded': 25,
      'in_transit': 50,
      'distribution_center': 75,
      'customs_clearance': 80,
      'out_for_delivery': 90,
      'delivered': 100,
      'completed': 100,
    };
    return statusProgress[status.toLowerCase()] || 0;
  }, []);

  // Get vehicle icon
  const vehicleIcon = useMemo(() => {
    switch (shipmentType?.toLowerCase()) {
      case 'air':
      case 'air_freight':
        return '✈️';
      case 'ocean':
      case 'ocean_freight':
        return '🚢';
      case 'rail':
      case 'rail_freight':
        return '🚂';
      case 'freight':
      case 'container':
        return '📦';
      default:
        return '🚛';
    }
  }, [shipmentType]);

  // Cached geocoding function
  const geocodeWithCache = useCallback(async (address: string): Promise<HERECoordinates | null> => {
    const cached = geocodingCache.get(address);
    if (cached) return cached;

    const result = await geocodeAddress(address);
    if (result) {
      geocodingCache.set(address, result.coordinates);
      return result.coordinates;
    }
    return null;
  }, []);

  // Initialize map IMMEDIATELY (no waiting for data)
  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl('light'),
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setLoadingStates(prev => ({ ...prev, map: false }));
    });

    return () => {
      pickupMarker.current?.remove();
      deliveryMarker.current?.remove();
      vehicleMarker.current?.remove();
      map.current?.remove();
    };
  }, []);

  // Load route data with PARALLEL API calls
  useEffect(() => {
    const loadRouteData = async () => {
      if (!map.current || !pickupAddress || !deliveryAddress) return;

      setLoadingStates(prev => ({ ...prev, geocoding: true, routing: true }));
      setError(null);

      try {
        // PARALLEL geocoding - both addresses at once
        const [pickupResult, deliveryResult] = await Promise.all([
          geocodeWithCache(pickupAddress),
          geocodeWithCache(deliveryAddress),
        ]);

        if (!pickupResult) throw new Error('Could not find pickup location');
        if (!deliveryResult) throw new Error('Could not find delivery location');

        setPickupCoords(pickupResult);
        setDeliveryCoords(deliveryResult);
        setLoadingStates(prev => ({ ...prev, geocoding: false }));

        // Add markers IMMEDIATELY after geocoding (don't wait for route)
        if (map.current) {
          // Pickup marker
          const pickupEl = document.createElement('div');
          pickupEl.style.cssText = 'width:30px;height:30px;border-radius:50%;background:#0B1F3A;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
          
          pickupMarker.current = new mapboxgl.Marker(pickupEl)
            .setLngLat([pickupResult.lng, pickupResult.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div class="p-2"><strong>Pickup</strong><br/>${pickupAddress}</div>`))
            .addTo(map.current);

          // Delivery marker
          const deliveryEl = document.createElement('div');
          deliveryEl.style.cssText = 'width:30px;height:30px;border-radius:50%;background:#1E5AA8;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)';
          
          deliveryMarker.current = new mapboxgl.Marker(deliveryEl)
            .setLngLat([deliveryResult.lng, deliveryResult.lat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div class="p-2"><strong>Delivery</strong><br/>${deliveryAddress}</div>`))
            .addTo(map.current);

          // Fit map to markers
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend([pickupResult.lng, pickupResult.lat]);
          bounds.extend([deliveryResult.lng, deliveryResult.lat]);
          map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
        }

        // Calculate route (parallel with marker display)
        const route = await calculateTruckRoute(pickupResult, deliveryResult);
        
        if (!route) throw new Error('Could not calculate route');

        setRouteData(route);
        setLoadingStates(prev => ({ ...prev, routing: false }));

        // Add route line and vehicle marker
        if (map.current && route.path.length > 0) {
          // Add route line
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.path.map(p => [p.lng, p.lat]),
              },
            },
          });

          map.current.addLayer({
            id: 'route',
            ...routeLineStyle,
            source: 'route',
          });

          // Calculate vehicle position
          const initialProgress = calculateProgressFromStatus(currentStatus);
          setProgress(initialProgress);

          const position = calculatePositionOnRoute(route.path, initialProgress);

          // Add vehicle marker
          const vehicleEl = document.createElement('div');
          vehicleEl.innerHTML = vehicleIcon;
          vehicleEl.style.cssText = 'font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

          vehicleMarker.current = new mapboxgl.Marker(vehicleEl)
            .setLngLat([position.lng, position.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="p-2"><strong>Current Location</strong><br/>${initialProgress.toFixed(1)}% complete<br/>Status: ${currentStatus.replace('_', ' ').toUpperCase()}</div>`)
            )
            .addTo(map.current);

          // Fit to full route
          const routeBounds = new mapboxgl.LngLatBounds();
          route.path.forEach(p => routeBounds.extend([p.lng, p.lat]));
          map.current.fitBounds(routeBounds, { padding: 80, duration: 1500 });
        }

      } catch (err: any) {
        console.error('Map loading error:', err);
        setError(err.message || 'Failed to load route');
        setLoadingStates({ map: false, geocoding: false, routing: false });
      }
    };

    loadRouteData();
  }, [pickupAddress, deliveryAddress, currentStatus, calculateProgressFromStatus, vehicleIcon, geocodeWithCache]);

  // Animate vehicle movement
  useEffect(() => {
    if (!routeData || !vehicleMarker.current || progress >= 100 || loadingStates.routing) return;

    const animationInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 0.3, 100);
        if (routeData.path && vehicleMarker.current) {
          const position = calculatePositionOnRoute(routeData.path, newProgress);
          vehicleMarker.current.setLngLat([position.lng, position.lat]);
          vehicleMarker.current.setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div class="p-2"><strong>Current Location</strong><br/>${newProgress.toFixed(1)}% complete<br/>Status: ${currentStatus.replace('_', ' ').toUpperCase()}</div>`)
          );
        }
        return newProgress;
      });
    }, 2000);

    return () => clearInterval(animationInterval);
  }, [routeData, progress, currentStatus, loadingStates.routing]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!shipmentId) return;

    const channel = supabase
      .channel(`shipment-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipmentId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          const newProgress = calculateProgressFromStatus(newStatus);
          setProgress(newProgress);

          if (routeData && vehicleMarker.current) {
            const position = calculatePositionOnRoute(routeData.path, newProgress);
            vehicleMarker.current.setLngLat([position.lng, position.lat]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId, routeData, calculateProgressFromStatus]);

  // Check for missing API keys
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
        <Package className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-yellow-900 mb-2">API Configuration Required</h3>
        <p className="text-sm text-yellow-800">
          Please configure Mapbox and HERE Maps API keys in <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code>
        </p>
      </div>
    );
  }

  // Calculate statistics
  const distanceTraveled = routeData ? (routeData.distance * progress) / 100 : 0;
  const distanceRemaining = routeData ? routeData.distance - distanceTraveled : 0;
  const isFullyLoaded = !loadingStates.geocoding && !loadingStates.routing;

  return (
    <div className="space-y-4">
      {/* Loading indicator (non-blocking) */}
      {(loadingStates.geocoding || loadingStates.routing) && (
        <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700">
            {loadingStates.geocoding ? 'Loading locations...' : 'Calculating route...'}
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <p className="text-xs text-red-700">Please verify addresses and API configuration</p>
          </div>
        </div>
      )}

      {/* Statistics (show immediately with skeleton for missing data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Distance</p>
          {isFullyLoaded && routeData ? (
            <p className="text-2xl font-bold text-primary">{formatDistance(routeData.distance)}</p>
          ) : (
            <div className="h-8 bg-muted animate-pulse rounded"></div>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Remaining</p>
          {isFullyLoaded && routeData ? (
            <p className="text-2xl font-bold text-accent">{formatDistance(distanceRemaining)}</p>
          ) : (
            <div className="h-8 bg-muted animate-pulse rounded"></div>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Duration</p>
          {isFullyLoaded && routeData ? (
            <p className="text-2xl font-bold text-primary">{formatDuration(routeData.duration)}</p>
          ) : (
            <div className="h-8 bg-muted animate-pulse rounded"></div>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Progress</p>
          <p className="text-2xl font-bold text-accent">{progress.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Map (renders IMMEDIATELY) */}
      <div
        ref={mapContainer}
        className="w-full h-[500px] rounded-lg shadow-lg border border-border bg-muted/50"
      />

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Shipment Progress</span>
          <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Pickup</span>
          <span className="capitalize">{currentStatus.replace('_', ' ')}</span>
          <span>Delivery</span>
        </div>
      </Card>
    </div>
  );
}