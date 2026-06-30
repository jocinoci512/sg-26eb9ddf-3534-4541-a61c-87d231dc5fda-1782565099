import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Truck, Ship, Plane, Navigation, Loader2, AlertCircle } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface ShipmentMapProps {
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  currentStatus: string;
  shipmentType?: string;
}

const getProgressFromStatus = (status: string): number => {
  const statusMap: Record<string, number> = {
    'pending_pickup': 10,
    'booked': 10,
    'picked_up': 30,
    'processing': 35,
    'loaded': 40,
    'in_transit': 60,
    'distribution_center': 75,
    'customs_clearance': 80,
    'out_for_delivery': 90,
    'delivered': 100,
    'completed': 100,
  };
  return statusMap[status.toLowerCase()] || 0;
};

const getVehicleIcon = (type?: string) => {
  if (!type) return '🚛';
  const iconMap: Record<string, string> = {
    'truck': '🚛',
    'air': '✈️',
    'ocean': '🚢',
    'rail': '🚂',
  };
  return iconMap[type.toLowerCase()] || '🚛';
};

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending_pickup': '#EAB308',
    'booked': '#3B82F6',
    'picked_up': '#6366F1',
    'processing': '#A855F7',
    'loaded': '#06B6D4',
    'in_transit': '#2563EB',
    'distribution_center': '#F97316',
    'customs_clearance': '#F59E0B',
    'out_for_delivery': '#22C55E',
    'delivered': '#059669',
    'completed': '#059669',
    'delayed': '#EF4444',
    'on_hold': '#6B7280',
    'cancelled': '#DC2626',
  };
  return colorMap[status.toLowerCase()] || '#6B7280';
};

export function ShipmentMap({ 
  pickupCity, 
  pickupState, 
  deliveryCity, 
  deliveryState, 
  currentStatus,
  shipmentType = 'truck'
}: ShipmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const progress = getProgressFromStatus(currentStatus);
  const vehicleEmoji = getVehicleIcon(shipmentType);
  const statusColor = getStatusColor(currentStatus);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!mapboxgl.accessToken) {
      setError('Mapbox token not configured');
      setLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Geocode pickup location
        const pickupQuery = `${pickupCity}, ${pickupState}, USA`;
        const pickupResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickupQuery)}.json?access_token=${mapboxgl.accessToken}`
        );
        const pickupData = await pickupResponse.json();
        const pickupCoords = pickupData.features?.[0]?.center;

        // Geocode delivery location
        const deliveryQuery = `${deliveryCity}, ${deliveryState}, USA`;
        const deliveryResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(deliveryQuery)}.json?access_token=${mapboxgl.accessToken}`
        );
        const deliveryData = await deliveryResponse.json();
        const deliveryCoords = deliveryData.features?.[0]?.center;

        if (!pickupCoords || !deliveryCoords) {
          setError('Could not locate addresses on map');
          setLoading(false);
          return;
        }

        // Create map
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: pickupCoords,
          zoom: 4,
        });

        // Add pickup marker (blue)
        const pickupMarkerEl = document.createElement('div');
        pickupMarkerEl.className = 'pickup-marker';
        pickupMarkerEl.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: #3B82F6;
            border: 4px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); color: white; font-size: 20px;">📦</div>
          </div>
        `;

        new mapboxgl.Marker({ element: pickupMarkerEl })
          .setLngLat(pickupCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div style="padding: 8px;"><strong>Pickup Location</strong><br/>${pickupCity}, ${pickupState}</div>`)
          )
          .addTo(newMap);

        // Add delivery marker (green)
        const deliveryMarkerEl = document.createElement('div');
        deliveryMarkerEl.className = 'delivery-marker';
        deliveryMarkerEl.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: ${progress === 100 ? '#059669' : '#22C55E'};
            border: 4px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); color: white; font-size: 20px;">📍</div>
          </div>
        `;

        new mapboxgl.Marker({ element: deliveryMarkerEl })
          .setLngLat(deliveryCoords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div style="padding: 8px;"><strong>Delivery Location</strong><br/>${deliveryCity}, ${deliveryState}</div>`)
          )
          .addTo(newMap);

        // Add route line
        newMap.on('load', () => {
          newMap.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [pickupCoords, deliveryCoords]
              }
            }
          });

          newMap.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': statusColor,
              'line-width': 4,
              'line-opacity': 0.8
            }
          });

          // Fit bounds to show entire route
          const bounds = new mapboxgl.LngLatBounds(pickupCoords, deliveryCoords);
          newMap.fitBounds(bounds, { padding: 100 });

          setMapReady(true);
          setLoading(false);
        });

        map.current = newMap;
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to load map');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      vehicleMarker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, [pickupCity, pickupState, deliveryCity, deliveryState]);

  // Update vehicle position when progress changes
  useEffect(() => {
    if (!map.current || !mapReady || loading) return;

    const updateVehiclePosition = async () => {
      try {
        // Geocode pickup and delivery again for coordinates
        const pickupQuery = `${pickupCity}, ${pickupState}, USA`;
        const pickupResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickupQuery)}.json?access_token=${mapboxgl.accessToken}`
        );
        const pickupData = await pickupResponse.json();
        const pickupCoords = pickupData.features?.[0]?.center;

        const deliveryQuery = `${deliveryCity}, ${deliveryState}, USA`;
        const deliveryResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(deliveryQuery)}.json?access_token=${mapboxgl.accessToken}`
        );
        const deliveryData = await deliveryResponse.json();
        const deliveryCoords = deliveryData.features?.[0]?.center;

        if (!pickupCoords || !deliveryCoords) return;

        // Calculate vehicle position along route
        const progressRatio = progress / 100;
        const vehiclePosition: [number, number] = [
          pickupCoords[0] + (deliveryCoords[0] - pickupCoords[0]) * progressRatio,
          pickupCoords[1] + (deliveryCoords[1] - pickupCoords[1]) * progressRatio
        ];

        // Remove old marker
        if (vehicleMarker.current) {
          vehicleMarker.current.remove();
        }

        // Add vehicle marker
        const vehicleMarkerEl = document.createElement('div');
        vehicleMarkerEl.innerHTML = `
          <div style="
            position: relative;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 60px;
              height: 60px;
              background: ${statusColor};
              opacity: 0.2;
              border-radius: 50%;
              animation: pulse 2s ease-out infinite;
            "></div>
            <div style="
              width: 50px;
              height: 50px;
              background: ${statusColor};
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 16px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              z-index: 1;
            ">
              ${vehicleEmoji}
            </div>
          </div>
        `;

        vehicleMarker.current = new mapboxgl.Marker({ element: vehicleMarkerEl })
          .setLngLat(vehiclePosition)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div style="padding: 8px;"><strong>${formatStatus(currentStatus)}</strong><br/>${progress}% Complete</div>`)
          )
          .addTo(map.current);

      } catch (err) {
        console.error('Vehicle position update error:', err);
      }
    };

    updateVehiclePosition();
  }, [progress, currentStatus, mapReady, loading, pickupCity, pickupState, deliveryCity, deliveryState, vehicleEmoji, statusColor]);

  if (error) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Navigation className="h-5 w-5 text-muted-foreground" />
            Shipment Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">Unable to Load Map</p>
              <p className="text-muted-foreground text-sm">{error}</p>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <span className="font-medium">Pickup:</span>
                  <span className="text-muted-foreground">{pickupCity}, {pickupState}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <span className="font-medium">Delivery:</span>
                  <span className="text-muted-foreground">{deliveryCity}, {deliveryState}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center justify-between gap-2 text-xl">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Live Shipment Tracking
            </div>
            <Badge 
              style={{ backgroundColor: statusColor, color: 'white' }}
              className="border-0 px-4 py-1.5 text-sm font-semibold shadow-md"
            >
              {progress}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapContainer} 
            className="w-full h-[500px] rounded-b-lg"
            style={{ minHeight: '500px' }}
          />
        </CardContent>
      </Card>

      {/* Route Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50">
          <div className="p-2 rounded-lg bg-blue-100">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Origin</p>
            <p className="font-bold">{pickupCity}, {pickupState}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary-200 bg-primary-50/50">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${statusColor}20` }}>
            <Package className="h-5 w-5" style={{ color: statusColor }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Status</p>
            <p className="font-bold">{formatStatus(currentStatus)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
          <div className="p-2 rounded-lg bg-green-100">
            <Navigation className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Destination</p>
            <p className="font-bold">{deliveryCity}, {deliveryState}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}