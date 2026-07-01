import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Navigation, Loader2, AlertCircle, Navigation2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    'open_carrier': '🚛',
    'enclosed_carrier': '🚛',
    'air_freight': '✈️',
    'ocean_freight': '🚢',
    'rail_freight': '🚂',
    'expedited': '⚡',
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
  currentStatus = 'in_transit',
  shipmentType = 'ground'
}: ShipmentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const vehicleMarker = useRef<mapboxgl.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState<string>('mapbox://styles/mapbox/light-v11');

  const progress = getProgressFromStatus(currentStatus);
  const vehicleEmoji = getVehicleIcon(shipmentType);
  const statusColor = getStatusColor(currentStatus);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

      if (!mapboxgl.accessToken) {
        setError('Map configuration error');
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

          // Create map with selected style
          const newMap = new mapboxgl.Map({
            container: mapContainer.current!,
            style: mapStyle,
            center: pickupCoords,
            zoom: 4,
            attributionControl: false,
          });

          // Add professional controls
          newMap.addControl(new mapboxgl.NavigationControl({
            showCompass: false
          }), 'top-right');

          // Add pickup marker (blue)
          const pickupMarkerEl = document.createElement('div');
          pickupMarkerEl.innerHTML = `
            <div style="
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #3B82F6, #2563EB);
              border: 4px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="transform: rotate(45deg); color: white; font-size: 24px; font-weight: bold;">📦</div>
            </div>
          `;

          new mapboxgl.Marker({ element: pickupMarkerEl })
            .setLngLat(pickupCoords)
            .setPopup(
              new mapboxgl.Popup({ offset: 30, className: 'custom-popup' })
                .setHTML(`
                  <div style="padding: 12px; min-width: 200px;">
                    <strong style="font-size: 14px; color: #0F172A;">Pickup Location</strong>
                    <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">${pickupCity}, ${pickupState}</p>
                  </div>
                `)
            )
            .addTo(newMap);

          // Add delivery marker (green/emerald)
          const deliveryMarkerEl = document.createElement('div');
          deliveryMarkerEl.innerHTML = `
            <div style="
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, ${progress === 100 ? '#059669' : '#22C55E'}, ${progress === 100 ? '#047857' : '#16A34A'});
              border: 4px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="transform: rotate(45deg); color: white; font-size: 24px; font-weight: bold;">📍</div>
            </div>
          `;

          new mapboxgl.Marker({ element: deliveryMarkerEl })
            .setLngLat(deliveryCoords)
            .setPopup(
              new mapboxgl.Popup({ offset: 30, className: 'custom-popup' })
                .setHTML(`
                  <div style="padding: 12px; min-width: 200px;">
                    <strong style="font-size: 14px; color: #0F172A;">Delivery Location</strong>
                    <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">${deliveryCity}, ${deliveryState}</p>
                  </div>
                `)
            )
            .addTo(newMap);

          // Add professional route line
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

            // Shadow layer for depth
            newMap.addLayer({
              id: 'route-shadow',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#000000',
                'line-width': 8,
                'line-opacity': 0.15,
                'line-blur': 4
              }
            });

            // Main route line
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
                'line-width': 6,
                'line-opacity': 0.9
              }
            });

            // Fit bounds to show entire route with padding
            const bounds = new mapboxgl.LngLatBounds(pickupCoords, deliveryCoords);
            newMap.fitBounds(bounds, { 
              padding: { top: 80, bottom: 80, left: 80, right: 80 },
              maxZoom: 8
            });

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
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to load map');
      setLoading(false);
    }
  }, [pickupCity, pickupState, deliveryCity, deliveryState, currentStatus, shipmentType, mapStyle]);

  const handleStyleChange = (style: string) => {
    setMapStyle(style);
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };

  const mapStyles = [
    { name: 'Light', value: 'mapbox://styles/mapbox/light-v11', icon: '☀️' },
    { name: 'Streets', value: 'mapbox://styles/mapbox/streets-v12', icon: '🗺️' },
    { name: 'Satellite', value: 'mapbox://styles/mapbox/satellite-streets-v12', icon: '🛰️' },
    { name: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12', icon: '🏔️' }
  ];

  // Update vehicle position when progress changes
  useEffect(() => {
    if (!map.current || !mapReady || loading) return;

    const updateVehiclePosition = async () => {
      try {
        // Geocode pickup and delivery for coordinates
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

        // Add vehicle marker with professional styling
        const vehicleMarkerEl = document.createElement('div');
        vehicleMarkerEl.innerHTML = `
          <div style="
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 80px;
              height: 80px;
              background: ${statusColor};
              opacity: 0.15;
              border-radius: 50%;
              animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            "></div>
            <div style="
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd);
              border: 5px solid white;
              border-radius: 50%;
              box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              z-index: 1;
            ">
              ${vehicleEmoji}
            </div>
          </div>
        `;

        vehicleMarker.current = new mapboxgl.Marker({ 
          element: vehicleMarkerEl,
          anchor: 'center'
        })
          .setLngLat(vehiclePosition)
          .setPopup(
            new mapboxgl.Popup({ offset: 40, className: 'custom-popup' })
              .setHTML(`
                <div style="padding: 12px; min-width: 200px;">
                  <strong style="font-size: 14px; color: #0F172A;">${formatStatus(currentStatus)}</strong>
                  <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; height: 8px; background: #E5E7EB; border-radius: 999px; overflow: hidden;">
                      <div style="height: 100%; background: ${statusColor}; width: ${progress}%; transition: width 0.5s;"></div>
                    </div>
                    <span style="font-size: 13px; font-weight: 600; color: ${statusColor};">${progress}%</span>
                  </div>
                </div>
              `)
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
      <Card className="border-2 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-accent/5">
          <CardTitle className="flex items-center justify-between gap-2 text-xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <span>Live Shipment Tracking</span>
            </div>
            <Badge 
              style={{ backgroundColor: statusColor, color: 'white' }}
              className="border-0 px-4 py-1.5 text-sm font-semibold shadow-lg"
            >
              {progress}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Loading tracking map...</p>
              </div>
            </div>
          )}
          <div 
            ref={mapContainer} 
            className="w-full h-[550px]"
            style={{ minHeight: '550px' }}
          />
        </CardContent>
      </Card>

      {/* Route Information Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group flex items-center gap-4 p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-semibold mb-0.5">ORIGIN</p>
            <p className="font-bold text-lg text-blue-900">{pickupCity}, {pickupState}</p>
          </div>
        </div>

        <div className="group flex items-center gap-4 p-5 rounded-xl border-2 bg-gradient-to-br hover:shadow-lg transition-all duration-300" 
             style={{ 
               borderColor: `${statusColor}40`,
               background: `linear-gradient(135deg, ${statusColor}08, ${statusColor}15)`
             }}>
          <div className="p-3 rounded-xl transition-colors" 
               style={{ backgroundColor: `${statusColor}20` }}>
            <Package className="h-6 w-6" style={{ color: statusColor }} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: statusColor }}>STATUS</p>
            <p className="font-bold text-lg" style={{ color: statusColor }}>{formatStatus(currentStatus)}</p>
          </div>
        </div>

        <div className="group flex items-center gap-4 p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
            <Navigation className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-green-600 font-semibold mb-0.5">DESTINATION</p>
            <p className="font-bold text-lg text-green-900">{deliveryCity}, {deliveryState}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        
        .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
        }
        
        .mapboxgl-popup-tip {
          display: none !important;
        }
        
        .mapboxgl-ctrl-group {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        .mapboxgl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
      `}</style>
    </div>
  );
}