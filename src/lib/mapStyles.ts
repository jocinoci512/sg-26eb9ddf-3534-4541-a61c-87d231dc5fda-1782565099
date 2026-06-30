/**
 * Custom Mapbox Map Styles for Go Cargo Logistics
 * Matches company branding: premium blue, white, dark gray
 */

export const goCargoDarkStyle = {
  version: 8,
  name: "Go Cargo Logistics Dark",
  sources: {
    "mapbox": {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  sprite: "mapbox://sprites/mapbox/dark-v11",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#0a1929" // Dark blue-gray background
      }
    },
    {
      id: "water",
      type: "fill",
      source: "mapbox",
      "source-layer": "water",
      paint: {
        "fill-color": "#0d2847" // Deep ocean blue
      }
    },
    {
      id: "landcover",
      type: "fill",
      source: "mapbox",
      "source-layer": "landcover",
      paint: {
        "fill-color": "#0f1f2e",
        "fill-opacity": 0.6
      }
    },
    {
      id: "landuse",
      type: "fill",
      source: "mapbox",
      "source-layer": "landuse",
      paint: {
        "fill-color": "#121f30"
      }
    },
    {
      id: "park",
      type: "fill",
      source: "mapbox",
      "source-layer": "landuse",
      filter: ["==", "class", "park"],
      paint: {
        "fill-color": "#1a3a52",
        "fill-opacity": 0.5
      }
    },
    {
      id: "building",
      type: "fill",
      source: "mapbox",
      "source-layer": "building",
      paint: {
        "fill-color": "#1e3a5f", // Medium blue-gray for buildings
        "fill-opacity": 0.7
      }
    },
    {
      id: "road-motorway-trunk",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["in", "class", "motorway", "trunk"],
      paint: {
        "line-color": "#2563eb", // Primary blue for major highways
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          5, 0.5,
          18, 18
        ]
      }
    },
    {
      id: "road-primary",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "primary"],
      paint: {
        "line-color": "#3b82f6", // Lighter blue for primary roads
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          5, 0.3,
          18, 14
        ]
      }
    },
    {
      id: "road-secondary-tertiary",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["in", "class", "secondary", "tertiary"],
      paint: {
        "line-color": "#60a5fa", // Even lighter blue for secondary roads
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          5, 0.2,
          18, 10
        ]
      }
    },
    {
      id: "road-street",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "street"],
      paint: {
        "line-color": "#334155", // Dark gray for streets
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          12, 0.5,
          18, 6
        ]
      }
    },
    {
      id: "border-country",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 0],
      paint: {
        "line-color": "#475569", // Medium gray for country borders
        "line-width": 2,
        "line-dasharray": [2, 2]
      }
    },
    {
      id: "border-state",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 1],
      paint: {
        "line-color": "#334155", // Darker gray for state borders
        "line-width": 1,
        "line-dasharray": [2, 2],
        "line-opacity": 0.7
      }
    },
    {
      id: "place-city",
      type: "symbol",
      source: "mapbox",
      "source-layer": "place",
      filter: ["==", "type", "city"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 14
      },
      paint: {
        "text-color": "#e2e8f0", // Light gray text
        "text-halo-color": "#0a1929",
        "text-halo-width": 2
      }
    },
    {
      id: "place-town",
      type: "symbol",
      source: "mapbox",
      "source-layer": "place",
      filter: ["==", "type", "town"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": 12
      },
      paint: {
        "text-color": "#cbd5e1", // Medium-light gray text
        "text-halo-color": "#0a1929",
        "text-halo-width": 1.5
      }
    }
  ]
};

export const goCargoLightStyle = {
  version: 8,
  name: "Go Cargo Logistics Light",
  sources: {
    "mapbox": {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8"
    }
  },
  sprite: "mapbox://sprites/mapbox/streets-v12",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#f8fafc" // Very light blue-gray
      }
    },
    {
      id: "water",
      type: "fill",
      source: "mapbox",
      "source-layer": "water",
      paint: {
        "fill-color": "#bfdbfe" // Light blue water
      }
    },
    {
      id: "landcover",
      type: "fill",
      source: "mapbox",
      "source-layer": "landcover",
      paint: {
        "fill-color": "#e0f2fe",
        "fill-opacity": 0.4
      }
    },
    {
      id: "landuse",
      type: "fill",
      source: "mapbox",
      "source-layer": "landuse",
      paint: {
        "fill-color": "#f1f5f9"
      }
    },
    {
      id: "park",
      type: "fill",
      source: "mapbox",
      "source-layer": "landuse",
      filter: ["==", "class", "park"],
      paint: {
        "fill-color": "#d1fae5",
        "fill-opacity": 0.6
      }
    },
    {
      id: "building",
      type: "fill",
      source: "mapbox",
      "source-layer": "building",
      paint: {
        "fill-color": "#e2e8f0", // Light gray for buildings
        "fill-opacity": 0.8
      }
    },
    {
      id: "road-motorway-trunk",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["in", "class", "motorway", "trunk"],
      paint: {
        "line-color": "#2563eb", // Primary blue for major highways
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          5, 1,
          18, 20
        ]
      }
    },
    {
      id: "road-primary",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "primary"],
      paint: {
        "line-color": "#3b82f6", // Lighter blue for primary roads
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          5, 0.8,
          18, 16
        ]
      }
    },
    {
      id: "road-secondary-tertiary",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["in", "class", "secondary", "tertiary"],
      paint: {
        "line-color": "#60a5fa", // Even lighter blue for secondary roads
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          5, 0.6,
          18, 12
        ]
      }
    },
    {
      id: "road-street",
      type: "line",
      source: "mapbox",
      "source-layer": "road",
      filter: ["==", "class", "street"],
      paint: {
        "line-color": "#94a3b8", // Medium gray for streets
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          12, 1,
          18, 8
        ]
      }
    },
    {
      id: "border-country",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 0],
      paint: {
        "line-color": "#64748b", // Medium gray for borders
        "line-width": 2,
        "line-dasharray": [3, 3]
      }
    },
    {
      id: "border-state",
      type: "line",
      source: "mapbox",
      "source-layer": "admin",
      filter: ["==", "admin_level", 1],
      paint: {
        "line-color": "#94a3b8",
        "line-width": 1,
        "line-dasharray": [3, 3],
        "line-opacity": 0.6
      }
    },
    {
      id: "place-city",
      type: "symbol",
      source: "mapbox",
      "source-layer": "place",
      filter: ["==", "type", "city"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 14
      },
      paint: {
        "text-color": "#1e293b", // Dark text
        "text-halo-color": "#ffffff",
        "text-halo-width": 2
      }
    },
    {
      id: "place-town",
      type: "symbol",
      source: "mapbox",
      "source-layer": "place",
      filter: ["==", "type", "town"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": 12
      },
      paint: {
        "text-color": "#334155", // Medium-dark text
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5
      }
    }
  ]
};

/**
 * Get the appropriate style URL for Mapbox
 * Uses custom styles when available, falls back to default Mapbox styles
 */
export function getMapStyleUrl(theme: 'light' | 'dark' = 'light'): string {
  // For now, use Mapbox's built-in styles with color overrides
  // In production, upload custom styles to Mapbox Studio and reference them here
  return theme === 'dark' 
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/light-v11';
}

/**
 * Custom route line style matching Go Cargo branding
 */
export const routeLineStyle = {
  type: 'line' as const,
  paint: {
    'line-color': '#2563eb', // Primary blue
    'line-width': 4,
    'line-opacity': 0.9,
  },
};

/**
 * Custom marker colors matching Go Cargo branding
 */
export const markerColors = {
  pickup: '#0B1F3A', // Premium dark blue (primary brand color)
  delivery: '#1E5AA8', // Bright blue (accent brand color)
  vehicle: '#2563eb', // Primary blue
  waypoint: '#60a5fa', // Light blue
};

/**
 * Map configuration options
 */
export const mapConfig = {
  defaultCenter: [-98.5795, 39.8283] as [number, number], // Center of USA
  defaultZoom: 4,
  minZoom: 2,
  maxZoom: 18,
  style: 'mapbox://styles/mapbox/light-v11', // Default style
};