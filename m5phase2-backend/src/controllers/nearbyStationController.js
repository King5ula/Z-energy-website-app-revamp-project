import { asyncHandler } from '../utils/asyncHandler.js';
import Station from '../models/nearbyStationModel.js';

// this basically returns every Z station as a plain array.
// The NearbyStation frontend loads the full national index once and then does
// its own distance + search filtering on the client, so it expects a raw array
// (not the { success, data } wrapper). We return the Mongoose documents as-is
// because the frontend reads their raw fields directly (location.coordinates,
// address string, priceZ91Unleaded, etc.).
export const getNearbyStations = asyncHandler(async (req, res) => {
  const stations = await Station.find({}).lean();
  res.status(200).json(stations);
});
