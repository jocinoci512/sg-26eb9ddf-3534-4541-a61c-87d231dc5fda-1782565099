import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Package, MapPin, TrendingUp } from 'lucide-react';

interface ShipmentMapProps {
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  currentStatus: string;
  shipmentType?: string;
}

// Status progress mapping
const statusProgress: Record<string, number> = {
  'booked': 0,
  'pending_pickup': 10,
  'picked_up': 25,
  'processing': 30,
  'loaded': 35,
  'in_transit': 60,
  'distribution_center': 80,
  'customs_clearance': 85,
  'out_for_delivery': 95,
  'delivered': 100,
  'completed': 100,
};

export function ShipmentMap({
  pickupCity,
  pickupState,
  deliveryCity,
  deliveryState,
  currentStatus,
  shipmentType = 'vehicle',
}: ShipmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);
  const [progress, setProgress] = useState(0);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<[number, number] | null>(null);

  // Get vehicle icon
  const getVehicleIcon = () => {
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
  };

  // Calculate progress from status
  useEffect(() => {
    const newProgress = statusProgress[currentStatus.toLowerCase()] || 0;
    setProgress(newProgress);
  }, [currentStatus]);

  // Initialize map ONCE (only when locations change)
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Map already initialized

    // Check if Mapbox token exists
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken || mapboxToken === 'your_mapbox_access_token_here') {
      return; // Will show fallback UI
    }

    mapboxgl.accessToken = mapboxToken;

    // Create map centered on USA
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', async () => {
      if (!map.current) return;

      try {
        // Use Mapbox Geocoding API (built-in, no external service needed)
        const pickupQuery = `${pickupCity}, ${pickupState}`;
        const deliveryQuery = `${deliveryCity}, ${deliveryState}`;

        // Geocode pickup location
        const pickupResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickupQuery)}.json?access_token=${mapboxToken}`
        );
        const pickupData = await pickupResponse.json();

        // Geocode delivery location
        const deliveryResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(deliveryQuery)}.json?access_token=${mapboxToken}`
        );
        const deliveryData = await deliveryResponse.json();

        if (!pickupData.features?.[0] || !deliveryData.features?.[0]) {
          console.error('Geocoding failed');
          return;
        }

        const pickup: [number, number] = pickupData.features[0].center;
        const delivery: [number, number] = deliveryData.features[0].center;

        setPickupCoords(pickup);
        setDeliveryCoords(delivery);

        // Add pickup marker (dark blue)
        new mapboxgl.Marker({ color: '#0B1F3A' })
          .setLngLat(pickup)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2"><strong>Pickup</strong><br/>${pickupCity}, ${pickupState}</div>`
            )
          )
          .addTo(map.current);

        // Add delivery marker (light blue)
        new mapboxgl.Marker({ color: '#1E5AA8' })
          .setLngLat(delivery)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2"><strong>Delivery</strong><br/>${deliveryCity}, ${deliveryState}</div>`
            )
          )
          .addTo(map.current);

        // Add simple route line
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [pickup, delivery],
            },
          },
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#2563eb',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        // Create vehicle marker
        const vehicleEl = document.createElement('div');
        vehicleEl.innerHTML = getVehicleIcon();
        vehicleEl.style.cssText = 'font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

        vehicleMarker.current = new mapboxgl.Marker({ element: vehicleEl })
          .setLngLat(pickup)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2"><strong>Current Location</strong><br/>0% complete<br/>Status: BOOKED</div>`
            )
          )
          .addTo(map.current);

        // Fit map to show both markers
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(pickup);
        bounds.extend(delivery);
        map.current.fitBounds(bounds, { padding: 80 });

      } catch (error) {
        console.error('Map initialization error:', error);
      }
    });

    return () => {
      vehicleMarker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, [pickupCity, pickupState, deliveryCity, deliveryState, shipmentType]);

  // Update vehicle position when progress changes (without recreating map)
  useEffect(() => {
    if (!vehicleMarker.current || !pickupCoords || !deliveryCoords) return;

    // Calculate new vehicle position
    const lng = pickupCoords[0] + (deliveryCoords[0] - pickupCoords[0]) * (progress / 100);
    const lat = pickupCoords[1] + (deliveryCoords[1] - pickupCoords[1]) * (progress / 100);

    // Update marker position
    vehicleMarker.current.setLngLat([lng, lat]);

    // Update popup content
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div class="p-2"><strong>Current Location</strong><br/>${progress}% complete<br/>Status: ${currentStatus.replace('_', ' ').toUpperCase()}</div>`
    );
    vehicleMarker.current.setPopup(popup);

  }, [progress, currentStatus, pickupCoords, deliveryCoords]);

  // Check if API key is configured
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken || mapboxToken === 'your_mapbox_access_token_here') {
    return (
      <div className="space-y-4">
        {/* Fallback: Simple Route Info */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Package className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3">Shipment Route</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pickup Location</p>
                    <p className="text-sm text-muted-foreground">{pickupCity}, {pickupState}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex-1 border-l-2 border-dashed border-muted-foreground h-8"></div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{currentStatus.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex-1 border-l-2 border-dashed border-muted-foreground h-8"></div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Delivery Location</p>
                    <p className="text-sm text-muted-foreground">{deliveryCity}, {deliveryState}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Shipment Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
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

        {/* Info message */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Interactive map available with Mapbox configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      <div
        ref={mapContainer}
        className="w-full h-[500px] rounded-lg shadow-lg border border-border"
      />

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Shipment Progress</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
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