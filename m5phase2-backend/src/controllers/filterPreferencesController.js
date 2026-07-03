import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import Station from '../models/nearbyStationModel.js';

// this basically handles filter preferences requests
export const getFilterPreferences = asyncHandler(async (req, res) => {
  // Return available filter options
  const filterOptions = {
    amenities: [
      'Car Wash',
      'ATM',
      'Restrooms',
      'Wi-Fi',
      'Coffee',
      'Food Court',
      'EV Charging',
      'Air Pump'
    ],
    services: [
      'Z Card Accepted',
      'Sharetank Available',
      'LPG Available',
      'AdBlue Available',
      'Premium Fuel',
      'Diesel'
    ],
    availability: ['Open Now']
  };

  sendSuccess(res, filterOptions, 'Filter preferences fetched successfully');
});

// ponytail: Actually filter stations instead of just echoing back preferences
// Ceiling: Maps frontend filter names to backend schema fields
// Upgrade: Add more sophisticated filtering (time-based for 'Open Now', multiple filters)
export const applyFilterPreferences = asyncHandler(async (req, res) => {
  const { amenities = [], services = [], openNow = false, lat, lng, limit = 50 } = req.body;

  // Build query based on filters
  const query = {};

  // Map amenities to schema fields
  amenities.forEach(amenity => {
    switch (amenity) {
      case 'Car Wash':
        query.hasZ2oCarwash = true;
        break;
      case 'ATM':
        query.hasAtm = true;
        break;
      case 'Restrooms':
        query.hasBathrooms = true;
        break;
      case 'Coffee':
        query.hasZEspressCoffeeFood = true;
        break;
      case 'EV Charging':
        query.hasEvCharging = true;
        break;
      // ponytail: Wi-Fi, Food Court, Air Pump not in schema - ignored for now
    }
  });

  // Map services to schema fields
  services.forEach(service => {
    switch (service) {
      case 'LPG Available':
        query.hasLpgSwapNGo = true;
        break;
      case 'AdBlue Available':
        query.hasAdBlueDieselFluid = true;
        break;
      case 'Premium Fuel':
        query.hasZxPremium = true;
        break;
      case 'Diesel':
        query.hasZDiesel = true;
        break;
      // ponytail: Z Card, Sharetank not in schema - ignored for now
    }
  });

  // ponytail: 'Open Now' filter not implemented - needs opening hours parsing
  // Ceiling: Schema has openingHours as string, not structured data
  // Upgrade: Parse openingHours and compare with current time

  let stations;

  // If coordinates provided, use geospatial query with filters
  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return sendError(res, new Error('Invalid coordinates'), 400);
    }

    stations = await Station.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 50000 // 50km radius
        }
      }
    }).limit(Math.min(parseInt(limit), 100)).lean();
  } else {
    // No coordinates - just filter without distance sorting
    stations = await Station.find(query)
      .limit(Math.min(parseInt(limit), 100))
      .lean();
  }

  const appliedFilters = {
    amenities,
    services,
    openNow,
    matchedStations: stations.length,
    stations
  };

  sendSuccess(res, appliedFilters, `Found ${stations.length} stations matching filters`);
});
