import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import { validateCoordinates } from '../utils/validators.js';
import Station from '../models/nearbyStationModel.js';

// this basically gets nearby stations based on coordinates or returns all stations
export const getNearbyStations = asyncHandler(async (req, res) => {
  const { lat, lng, limit = 230, radius, page = 1 } = req.query;

  if (lat && lng) {
    const { latitude, longitude } = validateCoordinates(lat, lng);

    // Configurable radius instead of hardcoded 100km, max 200km to prevent excessive results
    const searchRadius = radius ? Math.min(parseInt(radius), 200000) : 50000; // default 50km
    const maxLimit = Math.min(parseInt(limit), 250);

    // use geospatial query to find nearest stations
    const stations = await Station.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: searchRadius
        }
      }
    }).limit(maxLimit).lean();

    return sendSuccess(res, stations, 'Nearby stations fetched successfully');
  }

  // Pagination support for all-stations query + simple offset pagination (not cursor-based for large datasets)
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(parseInt(limit), 250);
  const skip = (pageNum - 1) * pageSize;

  const [stations, total] = await Promise.all([
    Station.find({}).skip(skip).limit(pageSize).lean(),
    Station.countDocuments({})
  ]);

  sendSuccess(res, {
    stations,
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize)
    }
  }, 'All stations fetched successfully');
});
