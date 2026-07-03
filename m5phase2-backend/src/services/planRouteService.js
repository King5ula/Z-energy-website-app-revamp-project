// ponytail: Route planning service with Google Maps API integration (Rung 4: External API)
// Why: Server-side API calls hide key, enable rate limiting, allow route caching
// Ceiling: Still dependent on Google Maps availability and pricing
// Upgrade: Add alternative routing providers (Mapbox, HERE) for failover

import Station from '../models/nearbyStationModel.js';
import { config } from '../config/env.js';

const GOOGLE_MAPS_API_KEY = config.googleMapsApiKey;
const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

// this basically calls Google Maps Directions API from the backend
export const calculateRoute = async (startLocation, destinationLocation, preferences = {}) => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Google Maps API key not configured');
  }

  const params = new URLSearchParams({
    origin: `${startLocation.lat},${startLocation.lng}`,
    destination: `${destinationLocation.lat},${destinationLocation.lng}`,
    mode: (preferences.travelMode || 'driving').toLowerCase(),
    key: GOOGLE_MAPS_API_KEY
  });

  if (preferences.avoidTolls) params.append('avoid', 'tolls');
  if (preferences.avoidHighways) params.append('avoid', 'highways');
  if (preferences.avoidFerries) params.append('avoid', 'ferries');

  const url = `${DIRECTIONS_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      distance: leg.distance.text,
      duration: leg.duration.text,
      distanceMeters: leg.distance.value,
      durationSeconds: leg.duration.value,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text
      })),
      polyline: route.overview_polyline.points
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    throw new Error(`Failed to calculate route: ${error.message}`);
  }
};

// this basically finds Z Energy stations within route bounding box
export const findStationsAlongRoute = async (startLocation, destinationLocation) => {
  const minLat = Math.min(startLocation.lat, destinationLocation.lat) - 0.1;
  const maxLat = Math.max(startLocation.lat, destinationLocation.lat) + 0.1;
  const minLng = Math.min(startLocation.lng, destinationLocation.lng) - 0.1;
  const maxLng = Math.max(startLocation.lng, destinationLocation.lng) + 0.1;

  try {
    const stations = await Station.find({
      location: {
        $geoWithin: {
          $box: [
            [minLng, minLat],
            [maxLng, maxLat]
          ]
        }
      }
    })
    .limit(20)
    .select('name address location city hasEvCharging hasZ91Unleaded hasZxPremium hasZDiesel')
    .lean();

    return stations.map(station => ({
      stationId: station._id,
      name: station.name,
      address: station.address,
      city: station.city,
      location: {
        lat: station.location.coordinates[1],
        lng: station.location.coordinates[0]
      },
      services: {
        hasEvCharging: station.hasEvCharging,
        hasZ91Unleaded: station.hasZ91Unleaded,
        hasZxPremium: station.hasZxPremium,
        hasZDiesel: station.hasZDiesel
      }
    }));
  } catch (error) {
    console.error('Error finding stations:', error);
    return [];
  }
};
