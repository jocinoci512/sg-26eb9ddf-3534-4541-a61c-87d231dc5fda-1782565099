import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Truck, Package, Plane, Ship, Train } from 'lucide-react';
import { 
  geocodeAddress, 
  calculateRoute, 
  calculatePositionOnRoute,
  formatDistance,
  formatDuration,
  type Coordinates,
  type RouteData,
} from '@/services/geocodingService';

interface ShipmentMapProps {
  pickupAddress: string;
  deliveryAddress: string;
  currentStatus: string;
  shipmentType?: string;
  estimatedDelivery?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795, // Center of USA
};

export function ShipmentMap({
  pickupAddress,
  deliveryAddress,
  currentStatus,
  shipmentType = 'vehicle',
  estimatedDelivery,
}: ShipmentMapProps) {
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<Coordinates | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(4);
  const [showPickupInfo, setShowPickupInfo] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [showCurrentInfo, setShowCurrentInfo] = useState(false);

  // Calculate progress based on status
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

  // Initialize map with geocoding and route calculation
  useEffect(() => {
    const initializeMap = async () => {
      setLoading(true);
      setError(null);

      try {
        // Geocode pickup address
        const pickupResult = await geocodeAddress(pickupAddress);
        if (!pickupResult) {
          throw new Error('Could not find pickup location');
        }
        setPickupCoords(pickupResult.coordinates);

        // Geocode delivery address
        const deliveryResult = await geocodeAddress(deliveryAddress);
        if (!deliveryResult) {
          throw new Error('Could not find delivery location');
        }
        setDeliveryCoords(deliveryResult.coordinates);

        // Calculate route
        const route = await calculateRoute(pickupAddress, deliveryAddress);
        if (!route) {
          throw new Error('Could not calculate route');
        }
        setRouteData(route);

        // Set map center to midpoint
        const centerLat = (pickupResult.coordinates.lat + deliveryResult.coordinates.lat) / 2;
        const centerLng = (pickupResult.coordinates.lng + deliveryResult.coordinates.lng) / 2;
        setMapCenter({ lat: centerLat, lng: centerLng });

        // Calculate appropriate zoom level
        const latDiff = Math.abs(pickupResult.coordinates.lat - deliveryResult.coordinates.lat);
        const lngDiff = Math.abs(pickupResult.coordinates.lng - deliveryResult.coordinates.lng);
        const maxDiff = Math.max(latDiff, lngDiff);
        
        let zoom = 4;
        if (maxDiff < 1) zoom = 10;
        else if (maxDiff < 5) zoom = 7;
        else if (maxDiff < 10) zoom = 6;
        else if (maxDiff < 20) zoom = 5;
        
        setMapZoom(zoom);

        // Calculate initial progress
        const initialProgress = calculateProgressFromStatus(currentStatus);
        setProgress(initialProgress);

        // Calculate current position on route
        if (route.path && route.path.length > 0) {
          const position = calculatePositionOnRoute(route.path, initialProgress);
          setCurrentPosition(position);
        }

      } catch (err: any) {
        console.error('Map initialization error:', err);
        setError(err.message || 'Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    if (pickupAddress && deliveryAddress) {
      initializeMap();
    }
  }, [pickupAddress, deliveryAddress, currentStatus, calculateProgressFromStatus]);

  // Animate vehicle movement
  useEffect(() => {
    if (!routeData || !routeData.path || progress >= 100) return;

    const animationInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 0.5, 100);
        if (routeData.path) {
          const position = calculatePositionOnRoute(routeData.path, newProgress);
          setCurrentPosition(position);
        }
        return newProgress;
      });
    }, 1000); // Update every second

    return () => clearInterval(animationInterval);
  }, [routeData, progress]);

  // Get vehicle icon based on shipment type
  const getVehicleIcon = () => {
    switch (shipmentType?.toLowerCase()) {
      case 'air':
      case 'air_freight':
        return Plane;
      case 'ocean':
      case 'ocean_freight':
        return Ship;
      case 'rail':
      case 'rail_freight':
        return Train;
      case 'freight':
      case 'container':
        return Package;
      default:
        return Truck;
    }
  };

  const VehicleIcon = getVehicleIcon();

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <p className="text-destructive">Google Maps API key not configured</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Please check the addresses and try again</p>
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
          <p className="text-sm text-muted-foreground">Distance</p>
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

      {/* Interactive Map */}
      <div className="relative">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={mapZoom}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
              zoomControl: true,
            }}
          >
            {/* Pickup Marker */}
            {pickupCoords && (
              <>
                <Marker
                  position={pickupCoords}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#0B1F3A',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                  }}
                  onClick={() => setShowPickupInfo(true)}
                />
                {showPickupInfo && (
                  <InfoWindow
                    position={pickupCoords}
                    onCloseClick={() => setShowPickupInfo(false)}
                  >
                    <div className="p-2">
                      <p className="font-bold text-sm">Pickup Location</p>
                      <p className="text-xs text-gray-600">{pickupAddress}</p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}

            {/* Delivery Marker */}
            {deliveryCoords && (
              <>
                <Marker
                  position={deliveryCoords}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#1E5AA8',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                  }}
                  onClick={() => setShowDeliveryInfo(true)}
                />
                {showDeliveryInfo && (
                  <InfoWindow
                    position={deliveryCoords}
                    onCloseClick={() => setShowDeliveryInfo(false)}
                  >
                    <div className="p-2">
                      <p className="font-bold text-sm">Delivery Location</p>
                      <p className="text-xs text-gray-600">{deliveryAddress}</p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}

            {/* Route Polyline */}
            {routeData && routeData.path && (
              <>
                {/* Completed route (traveled) */}
                <Polyline
                  path={routeData.path.slice(0, Math.floor((routeData.path.length * progress) / 100))}
                  options={{
                    strokeColor: '#1E5AA8',
                    strokeOpacity: 1,
                    strokeWeight: 5,
                  }}
                />
                {/* Remaining route (not traveled) */}
                <Polyline
                  path={routeData.path.slice(Math.floor((routeData.path.length * progress) / 100))}
                  options={{
                    strokeColor: '#CBD5E1',
                    strokeOpacity: 0.6,
                    strokeWeight: 5,
                    strokePattern: 'dashed',
                  }}
                />
              </>
            )}

            {/* Current Position Marker */}
            {currentPosition && progress > 0 && progress < 100 && (
              <>
                <Marker
                  position={currentPosition}
                  icon={{
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6,
                    fillColor: '#FF6B35',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                    rotation: 0,
                  }}
                  onClick={() => setShowCurrentInfo(true)}
                />
                {showCurrentInfo && (
                  <InfoWindow
                    position={currentPosition}
                    onCloseClick={() => setShowCurrentInfo(false)}
                  >
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <VehicleIcon className="w-4 h-4 text-primary" />
                        <p className="font-bold text-sm">Current Location</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {progress.toFixed(1)}% complete
                      </p>
                      <p className="text-xs text-gray-600">
                        Status: {currentStatus.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

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