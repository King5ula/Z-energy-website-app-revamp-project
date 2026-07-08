import express from 'express';
import {
  getAllStations,
  getRegions,
  getSuburbsByRegion,
  getStationsBySuburb,
  getStationById,
  getNearestStations
} from '../controllers/stationController.js';

const router = express.Router();

// this basically defines all station-related API routes
// ponytail: Specific routes MUST come before parameterized routes
// Fix: /stations/nearest must be registered before /stations/:id
// Otherwise Express matches "nearest" as an :id parameter, causing 400 errors
router.get('/stations/nearest', getNearestStations);
router.get('/stations/:id', getStationById);
router.get('/stations', getAllStations);
router.get('/regions', getRegions);
router.get('/regions/:region/suburbs', getSuburbsByRegion);
router.get('/suburbs/:suburb/stations', getStationsBySuburb);

export default router;