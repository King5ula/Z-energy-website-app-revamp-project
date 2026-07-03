// ponytail: Express REST routing for route planning (Rung 1: Framework routing)
// Why: Express Router provides modular route organization and middleware chaining
// Ceiling: RESTful HTTP only, no WebSocket for real-time route updates
// Upgrade: Add Socket.io if need live traffic updates or collaborative route planning

import { Router } from 'express';
import {
  createRoute,
  getRouteById,
  getUserRoutes,
  deleteRoute
} from '../controllers/planRouteController.js';

const router = Router();

// this basically defines route planning REST API endpoints
// POST /api/plan-routes - Calculate and save a new route
router.post('/', createRoute);

// GET /api/plan-routes/:id - Retrieve a specific route by ID
router.get('/:id', getRouteById);

// GET /api/plan-routes - Get user's route history
router.get('/', getUserRoutes);

// DELETE /api/plan-routes/:id - Delete a route from history
router.delete('/:id', deleteRoute);

export default router;
