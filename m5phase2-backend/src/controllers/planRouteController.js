// ponytail: Route planning controller with persistence (Rung 2: Mongoose + Rung 4: Google API)
// Why: Combines route calculation with database storage for history and optimization
// Ceiling: Synchronous processing, no background job queue for heavy calculations
// Upgrade: Add Bull/BullMQ if route calculations need queuing or retry logic

import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import { validateCoordinates } from '../utils/validators.js';
import Route from '../models/planRouteModel.js';
import * as planRouteService from '../services/planRouteService.js';

// this basically creates and calculates a new route with station suggestions
export const createRoute = asyncHandler(async (req, res) => {
  const {
    startPoint,
    destination,
    startLocation,
    destinationLocation,
    preferences,
    userId
  } = req.body;

  if (!startPoint || !destination) {
    return sendError(res, new Error('Start point and destination are required'), 400);
  }

  if (!startLocation || !destinationLocation) {
    return sendError(res, new Error('Start and destination coordinates are required'), 400);
  }

  try {
    validateCoordinates(startLocation.lat, startLocation.lng);
    validateCoordinates(destinationLocation.lat, destinationLocation.lng);
  } catch (error) {
    return sendError(res, error, 400);
  }

  try {
    const routeData = await planRouteService.calculateRoute(
      startLocation,
      destinationLocation,
      preferences
    );

    const stationsAlongRoute = await planRouteService.findStationsAlongRoute(
      startLocation,
      destinationLocation
    );

    const route = new Route({
      userId: userId || 'anonymous',
      startPoint: {
        address: startPoint,
        location: startLocation
      },
      destination: {
        address: destination,
        location: destinationLocation
      },
      preferences: preferences || {},
      routeData,
      stationsAlongRoute
    });

    await route.save();

    sendSuccess(res, {
      routeId: route._id,
      route: {
        startPoint,
        destination,
        distance: routeData.distance,
        duration: routeData.duration,
        startAddress: routeData.startAddress,
        endAddress: routeData.endAddress,
        steps: routeData.steps,
        polyline: routeData.polyline
      },
      stations: stationsAlongRoute,
      createdAt: route.createdAt
    }, 'Route calculated successfully', 201);

  } catch (error) {
    console.error('Error creating route:', error);
    sendError(res, error, 500);
  }
});

// this basically retrieves a previously calculated route by ID
export const getRouteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const route = await Route.findById(id);

    if (!route) {
      return sendError(res, new Error('Route not found'), 404);
    }

    route.lastAccessedAt = new Date();
    await route.save();

    sendSuccess(res, {
      routeId: route._id,
      startPoint: route.startPoint.address,
      destination: route.destination.address,
      distance: route.routeData.distance,
      duration: route.routeData.duration,
      steps: route.routeData.steps,
      stations: route.stationsAlongRoute,
      createdAt: route.createdAt
    });

  } catch (error) {
    console.error('Error fetching route:', error);
    sendError(res, error, 500);
  }
});

// this basically retrieves route history for a user
export const getUserRoutes = asyncHandler(async (req, res) => {
  const { userId = 'anonymous' } = req.query;
  const { limit = 10, page = 1 } = req.query;

  try {
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * pageSize;

    const [routes, total] = await Promise.all([
      Route.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select('startPoint destination routeData createdAt')
        .lean(),
      Route.countDocuments({ userId })
    ]);

    const formattedRoutes = routes.map(route => ({
      routeId: route._id,
      startPoint: route.startPoint.address,
      destination: route.destination.address,
      distance: route.routeData?.distance,
      duration: route.routeData?.duration,
      createdAt: route.createdAt
    }));

    sendSuccess(res, {
      routes: formattedRoutes,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize)
      }
    });

  } catch (error) {
    console.error('Error fetching user routes:', error);
    sendError(res, error, 500);
  }
});

// this basically deletes a route from history
export const deleteRoute = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const route = await Route.findByIdAndDelete(id);

    if (!route) {
      return sendError(res, new Error('Route not found'), 404);
    }

    sendSuccess(res, { deletedRouteId: id }, 'Route deleted successfully');

  } catch (error) {
    console.error('Error deleting route:', error);
    sendError(res, error, 500);
  }
});
