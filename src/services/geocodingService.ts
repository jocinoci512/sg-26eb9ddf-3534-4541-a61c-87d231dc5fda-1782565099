/**
 * Geocoding Service
 * Converts addresses to coordinates and calculates routes
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  path: Coordinates[];
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

/**
 * Geocode an address to coordinates using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results[0]) {
      const result = data.results[0];
      return {
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate route between two points using Google Maps Directions API
 */
export async function calculateRoute(
  origin: string,
  destination: string
): Promise<RouteData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return null;
    }

    const encodedOrigin = encodeURIComponent(origin);
    const encodedDestination = encodeURIComponent(destination);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodedOrigin}&destination=${encodedDestination}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.routes[0]) {
      const route = data.routes[0];
      const leg = route.legs[0];

      // Extract path coordinates from route
      const path: Coordinates[] = [];
      route.overview_polyline?.points && 
        decodePolyline(route.overview_polyline.points).forEach(point => path.push(point));

      return {
        distance: leg.distance.value, // meters
        duration: leg.duration.value, // seconds
        path: path.length > 0 ? path : [
          { lat: leg.start_location.lat, lng: leg.start_location.lng },
          { lat: leg.end_location.lat, lng: leg.end_location.lng },
        ],
      };
    }

    return null;
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
}

/**
 * Decode Google Maps polyline string to coordinates array
 */
function decodePolyline(encoded: string): Coordinates[] {
  const poly: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return poly;
}

/**
 * Calculate position along route based on progress percentage
 */
export function calculatePositionOnRoute(
  path: Coordinates[],
  progressPercentage: number
): Coordinates {
  if (!path || path.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (progressPercentage <= 0) return path[0];
  if (progressPercentage >= 100) return path[path.length - 1];

  // Calculate total path length
  let totalDistance = 0;
  const segmentDistances: number[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const dist = getDistanceBetweenPoints(path[i], path[i + 1]);
    segmentDistances.push(dist);
    totalDistance += dist;
  }

  // Find position along path
  const targetDistance = (progressPercentage / 100) * totalDistance;
  let accumulatedDistance = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    if (accumulatedDistance + segmentDistances[i] >= targetDistance) {
      const segmentProgress = (targetDistance - accumulatedDistance) / segmentDistances[i];
      return interpolatePoint(path[i], path[i + 1], segmentProgress);
    }
    accumulatedDistance += segmentDistances[i];
  }

  return path[path.length - 1];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistanceBetweenPoints(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Interpolate between two points
 */
function interpolatePoint(point1: Coordinates, point2: Coordinates, fraction: number): Coordinates {
  return {
    lat: point1.lat + (point2.lat - point1.lat) * fraction,
    lng: point1.lng + (point2.lng - point1.lng) * fraction,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 1) {
    return `${Math.round(meters)} m`;
  }
  return `${miles.toFixed(1)} miles`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculate ETA based on current progress
 */
export function calculateETA(
  totalDuration: number,
  progressPercentage: number
): Date {
  const remainingSeconds = (totalDuration * (100 - progressPercentage)) / 100;
  const eta = new Date();
  eta.setSeconds(eta.getSeconds() + remainingSeconds);
  return eta;
}