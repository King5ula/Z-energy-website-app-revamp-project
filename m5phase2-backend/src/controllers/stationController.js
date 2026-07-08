import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import { validateCoordinates } from '../utils/validators.js';
import { formatStationForFrontend, formatStationsForFrontend } from '../utils/stationFormatter.js';
import Station from '../models/nearbyStationModel.js';

// Region centroids for New Zealand regions
export const regionCentroids = {
  'Northland': { lat: -35.7275, lng: 174.3236 },
  'Auckland': { lat: -36.8485, lng: 174.7633 },
  'Waikato': { lat: -37.7870, lng: 175.2793 },
  'Bay of Plenty': { lat: -37.6878, lng: 176.1651 },
  'Gisborne': { lat: -38.6626, lng: 178.0176 },
  'Hawke\'s Bay': { lat: -39.4902, lng: 176.9174 },
  'Taranaki': { lat: -39.0556, lng: 174.0752 },
  'Manawatu-Wanganui': { lat: -39.9332, lng: 175.0501 },
  'Wellington': { lat: -41.2865, lng: 174.7762 },
  'Tasman': { lat: -41.2706, lng: 172.9897 },
  'Nelson': { lat: -41.2706, lng: 173.2840 },
  'Marlborough': { lat: -41.5131, lng: 173.9580 },
  'West Coast': { lat: -42.4509, lng: 171.2103 },
  'Canterbury': { lat: -43.5321, lng: 172.6362 },
  'Otago': { lat: -45.0312, lng: 169.3176 },
  'Southland': { lat: -46.4132, lng: 168.3538 }
};

// this basically gets all stations
export const getAllStations = asyncHandler(async (req, res) => {
  const stations = await Station.find({}).lean();
  const formattedStations = formatStationsForFrontend(stations);
  sendSuccess(res, formattedStations, 'All stations fetched successfully');
});

// this basically gets all regions with their station counts
export const getRegions = asyncHandler(async (req, res) => {
  const regions = await Station.aggregate([
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 }
      }
    }
  ]);

  // add centroids to each region
  const regionsWithCentroids = regions.map(region => ({
    region: region._id,
    count: region.count,
    centroid: regionCentroids[region._id] || { lat: 0, lng: 0 }
  }));

  sendSuccess(res, regionsWithCentroids, 'Regions fetched successfully');
});

// this basically gets all suburbs within a specific region with their station counts
export const getSuburbsByRegion = asyncHandler(async (req, res) => {
  const { region } = req.params;

  if (!region) {
    return sendError(res, new Error('Region parameter is required'), 400);
  }

  const suburbs = await Station.aggregate([
    {
      $match: { 'city': region }
    },
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
        // get the first station's coordinates as suburb centroid
        lat: { $first: { $arrayElemAt: ['$location.coordinates', 1] } },
        lng: { $first: { $arrayElemAt: ['$location.coordinates', 0] } }
      }
    }
  ]);

  const suburbsFormatted = suburbs.map(suburb => ({
    suburb: suburb._id,
    count: suburb.count,
    centroid: { lat: suburb.lat, lng: suburb.lng }
  }));

  sendSuccess(res, suburbsFormatted, `Suburbs in ${region} fetched successfully`);
});

// this basically gets all stations in a specific suburb
export const getStationsBySuburb = asyncHandler(async (req, res) => {
  const { suburb } = req.params;
  const { region } = req.query;

  if (!suburb) {
    return sendError(res, new Error('Suburb parameter is required'), 400);
  }

  const query = { 'city': suburb };
  if (region) {
    query['city'] = region;
  }

  const stations = await Station.find(query).lean();
  const formattedStations = formatStationsForFrontend(stations);

  sendSuccess(res, formattedStations, `Stations in ${suburb} fetched successfully`);
});

// this basically gets a single station by ID
export const getStationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const station = await Station.findById(id).lean();

  if (!station) {
    return sendError(res, new Error('Station not found'), 404);
  }

  const formattedStation = formatStationForFrontend(station);
  sendSuccess(res, formattedStation, 'Station fetched successfully');
});

// this basically finds the nearest stations to a given lat/lng
export const getNearestStations = asyncHandler(async (req, res) => {
  const { lat, lng, limit = 5 } = req.query;

  if (!lat || !lng) {
    return sendError(res, new Error('lat and lng parameters are required'), 400);
  }

  const { latitude, longitude } = validateCoordinates(lat, lng);
  const maxLimit = Math.min(parseInt(limit), 20);

  // use geospatial query to find nearest stations
  const stations = await Station.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: 50000
      }
    }
  }).limit(maxLimit).lean();

  const formattedStations = formatStationsForFrontend(stations);
  sendSuccess(res, formattedStations, 'Nearest stations fetched successfully');
});