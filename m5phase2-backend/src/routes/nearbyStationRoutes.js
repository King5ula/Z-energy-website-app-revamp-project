// ponytail: Express REST routing (Rung 1: Framework routing)
// Why: Express Router provides modular route organization and middleware chaining
// Ceiling: RESTful HTTP only, can't use WebSocket or Server-Sent Events directly
// Upgrade: Add Socket.io if need real-time station updates

import express from 'express';
import { getNearbyStations } from '../controllers/nearbyStationController.js';

const router = express.Router();

// this basically defines nearby station routes
router.get('/', getNearbyStations);

export default router;
