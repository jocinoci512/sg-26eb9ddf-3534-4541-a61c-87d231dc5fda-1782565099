import { useEffect, useState, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, Package, Plane, Ship, Train, Loader2 } from 'lucide-react';
import { 
  geocodeAddress, 
  calculateTruckRoute, 
  calculatePositionOnRoute,
  formatDistance,
  formatDuration,
  type HERECoordinates,
  type HERERouteData,
} from '@/services/hereMapsService';
import { supabase } from '@/integrations/supabase/client';

interface ShipmentMapProps {
  shipmentId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  currentStatus: string;
  shipmentType?: string;
  estimatedDelivery?: string;
}

export function ShipmentMap({
  shipmentId,
  pickupAddress,
  deliveryAddress,
  currentStatus,
  shipmentType = 'vehicle',
  estimatedDelivery,
}: ShipmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const deliveryMarker = useRef<mapboxgl.Marker | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);

  const [pickupCoords, setPickupCoords] = useState<HERECoordinates | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<HERECoordinates | null>(null);
  const [routeData, setRouteData] = useState<HERERouteData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<HERECoordinates | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
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

  // Get vehicle icon based on shipment type
  const getVehicleIcon = useCallback(() => {
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      pickupMarker.current?.remove();
      deliveryMarker.current?.remove();
      vehicleMarker.current?.remove();
      map.current?.remove();
    };
  }, []);

  // Initialize route and markers
  useEffect(() => {
    const initializeRoute = async () => {
      if (!map.current) return;

      setLoading(true);
      setError(null);

      try {
        // Geocode addresses using HERE Maps
        const pickupResult = await geocodeAddress(pickupAddress);
        if (!pickupResult) {
          throw new Error('Could not find pickup location');
        }
        setPickupCoords(pickupResult.coordinates);

        const deliveryResult = await geocodeAddress(deliveryAddress);
        if (!deliveryResult) {
          throw new Error('Could not find delivery location');
        }
        setDeliveryCoords(deliveryResult.coordinates);

        // Calculate route using HERE Maps
        const route = await calculateTruckRoute(
          pickupResult.coordinates,
          deliveryResult.coordinates
        );
        if (!route) {
          throw new Error('Could not calculate route');
        }
        setRouteData(route);

        // Add pickup marker
        const pickupEl = document.createElement('div');
        pickupEl.className = 'marker-pickup';
        pickupEl.style.width = '30px';
        pickupEl.style.height = '30px';
        pickupEl.style.borderRadius = '50%';
        pickupEl.style.backgroundColor = '#0B1F3A';
        pickupEl.style.border = '3px solid white';
        pickupEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        pickupMarker.current = new mapboxgl.Marker(pickupEl)
          .setLngLat([pickupResult.coordinates.lng, pickupResult.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div class="p-2"><strong>Pickup</strong><br/>${pickupAddress}</div>`)
          )
          .addTo(map.current);

        // Add delivery marker
        const deliveryEl = document.createElement('div');
        deliveryEl.className = 'marker-delivery';
        deliveryEl.style.width = '30px';
        deliveryEl.style.height = '30px';
        deliveryEl.style.borderRadius = '50%';
        deliveryEl.style.backgroundColor = '#1E5AA8';
        deliveryEl.style.border = '3px solid white';
        deliveryEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        deliveryMarker.current = new mapboxgl.Marker(deliveryEl)
          .setLngLat([deliveryResult.coordinates.lng, deliveryResult.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div class="p-2"><strong>Delivery</strong><br/>${deliveryAddress}</div>`)
          )
          .addTo(map.current);

        // Add route line
        const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.path.map(p => [p.lng, p.lat]),
          },
        };

        if (map.current.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON,
          });

          map.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#1E5AA8',
              'line-width': 5,
              'line-opacity': 0.8,
            },
          });
        }

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.path.forEach(p => bounds.extend([p.lng, p.lat]));
        map.current.fitBounds(bounds, { padding: 80 });

        // Calculate initial progress and position
        const initialProgress = calculateProgressFromStatus(currentStatus);
        setProgress(initialProgress);

        if (route.path.length > 0) {
          const position = calculatePositionOnRoute(route.path, initialProgress);
          setCurrentPosition(position);

          // Add vehicle marker
          const vehicleEl = document.createElement('div');
          vehicleEl.innerHTML = getVehicleIcon();
          vehicleEl.style.fontSize = '32px';
          vehicleEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

          vehicleMarker.current = new mapboxgl.Marker(vehicleEl)
            .setLngLat([position.lng, position.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="p-2"><strong>Current Location</strong><br/>${progress.toFixed(1)}% complete<br/>Status: ${currentStatus.replace('_', ' ').toUpperCase()}</div>`)
            )
            .addTo(map.current);
        }

      } catch (err: any) {
        console.error('Map initialization error:', err);
        setError(err.message || 'Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    if (pickupAddress && deliveryAddress) {
      initializeRoute();
    }
  }, [pickupAddress, deliveryAddress, currentStatus, calculateProgressFromStatus, getVehicleIcon]);

  // Animate vehicle movement
  useEffect(() => {
    if (!routeData || !vehicleMarker.current || progress >= 100) return;

    const animationInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 0.3, 100);
        if (routeData.path && vehicleMarker.current) {
          const position = calculatePositionOnRoute(routeData.path, newProgress);
          setCurrentPosition(position);
          vehicleMarker.current.setLngLat([position.lng, position.lat]);
          
          // Update popup
          vehicleMarker.current.setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div class="p-2"><strong>Current Location</strong><br/>${newProgress.toFixed(1)}% complete<br/>Status: ${currentStatus.replace('_', ' ').toUpperCase()}</div>`)
          );
        }
        return newProgress;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(animationInterval);
  }, [routeData, progress, currentStatus]);

  // Subscribe to real-time shipment updates
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
            setCurrentPosition(position);
            vehicleMarker.current.setLngLat([position.lng, position.lat]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId, routeData, calculateProgressFromStatus]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <p className="text-destructive">Map configuration incomplete. Please configure Mapbox and HERE Maps API keys.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading live GPS tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Please verify addresses and try again</p>
      </div>
    );
  }

  const distanceTraveled = routeData ? (routeData.distance * progress) / 100 : 0;
  const distanceRemaining = routeData ? routeData.distance - distanceTraveled : 0;

  return (
    <div className="space-y-4">
      {/* Map Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Distance</p>
          <p className="text-2xl font-bold text-primary">
            {routeData ? formatDistance(routeData.distance) : '-'}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold text-accent">
            {formatDistance(distanceRemaining)}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="text-2xl font-bold text-primary">
            {routeData ? formatDuration(routeData.duration) : '-'}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-2xl font-bold text-accent">
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Mapbox Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-[500px] rounded-lg shadow-lg border border-border"
      />

      {/* Progress Bar */}
      <div className="bg-card border rounded-lg p-4">
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
      </div>
    </div>
  );
}