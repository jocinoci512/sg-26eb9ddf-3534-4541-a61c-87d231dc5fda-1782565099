/**
 * HERE Maps Service
 * Enterprise geocoding, routing, and ETA calculations for logistics
 */

export interface HERECoordinates {
  lat: number;
  lng: number;
}

export interface HERERouteData {
  distance: number; // meters
  duration: number; // seconds
  path: HERECoordinates[];
  summary: string;
}

export interface HEREGeocodingResult {
  coordinates: HERECoordinates;
  formattedAddress: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Geocode address using HERE Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<HEREGeocodingResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('HERE Maps API key not configured');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodedAddress}&apiKey=${apiKey}`
    );

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        coordinates: {
          lat: item.position.lat,
          lng: item.position.lng,
        },
        formattedAddress: item.address.label,
        city: item.address.city,
        state: item.address.state,
        country: item.address.countryName,
      };
    }

    return null;
  } catch (error) {
    console.error('HERE Maps geocoding error:', error);
    return null;
  }
}

/**
 * Calculate truck route using HERE Maps Routing API
 * Optimized for logistics with traffic awareness
 */
export async function calculateTruckRoute(
  origin: HERECoordinates,
  destination: HERECoordinates
): Promise<HERERouteData | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('HERE Maps API key not configured');
      return null;
    }

    const response = await fetch(
      `https://router.hereapi.com/v8/routes?` +
      `transportMode=truck&` +
      `origin=${origin.lat},${origin.lng}&` +
      `destination=${destination.lat},${destination.lng}&` +
      `return=polyline,summary&` +
      `apiKey=${apiKey}`
    );

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const section = route.sections[0];

      // Decode HERE flexible polyline
      const path = decodeHEREPolyline(section.polyline);

      return {
        distance: section.summary.length, // meters
        duration: section.summary.duration, // seconds
        path,
        summary: `${(section.summary.length / 1000).toFixed(1)} km, ${Math.round(section.summary.duration / 60)} min`,
      };
    }

    return null;
  } catch (error) {
    console.error('HERE Maps routing error:', error);
    return null;
  }
}

/**
 * Decode HERE flexible polyline format
 * https://github.com/heremaps/flexible-polyline
 */
function decodeHEREPolyline(encoded: string): HERECoordinates[] {
  const coords: HERECoordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const precision = 5; // HERE uses precision 5 by default

  const decodeValue = () => {
    let value = 0;
    let shift = 0;
    let byte = 0x20;

    while (byte >= 0x20) {
      byte = encoded.charCodeAt(index++) - 63;
      value |= (byte & 0x1f) << shift;
      shift += 5;
    }

    return value & 1 ? ~(value >> 1) : value >> 1;
  };

  while (index < encoded.length) {
    lat += decodeValue();
    lng += decodeValue();

    coords.push({
      lat: lat / Math.pow(10, precision),
      lng: lng / Math.pow(10, precision),
    });
  }

  return coords;
}

/**
 * Calculate position along route based on progress
 */
export function calculatePositionOnRoute(
  path: HERECoordinates[],
  progressPercentage: number
): HERECoordinates {
  if (!path || path.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (progressPercentage <= 0) return path[0];
  if (progressPercentage >= 100) return path[path.length - 1];

  const targetIndex = Math.floor((path.length - 1) * (progressPercentage / 100));
  const fraction = ((path.length - 1) * (progressPercentage / 100)) - targetIndex;

  if (targetIndex >= path.length - 1) {
    return path[path.length - 1];
  }

  const p1 = path[targetIndex];
  const p2 = path[targetIndex + 1];

  return {
    lat: p1.lat + (p2.lat - p1.lat) * fraction,
    lng: p1.lng + (p2.lng - p1.lng) * fraction,
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
 * Calculate ETA based on remaining duration
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