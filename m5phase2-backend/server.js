// ponytail: Express REST API server (Rung 1: Framework)
// Why: Industry standard Node.js web framework, middleware ecosystem, routing
// Ceiling: Opinionated middleware pattern, can't use raw http for custom protocols
// Upgrade: Native http/http2 module if need WebSocket-heavy or custom protocols

import { config } from "./src/config/env.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/db/connect.js";

import entryRoutes from "./src/routes/entryRoutes.js";
import planRouteRoutes from "./src/routes/planRouteRoutes.js";
import nearbyStationRoutes from "./src/routes/nearbyStationRoutes.js";
import filterPreferencesRoutes from "./src/routes/filterPreferencesRoutes.js";
import stationRoutes from "./src/routes/stationRoutes.js";

const app = express();

// ponytail: CORS middleware to allow frontend requests (Rung 1: Express middleware)
// Ceiling: Simple origin string, no dynamic CORS logic
app.use(
  cors({
    origin: config.frontendOrigin,
  }),
);

app.use(express.json());

// this basically provides a health check endpoint for monitoring
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "m5phase2-backend",
    mongo: "connected",
  });
});

// ponytail: REST API routes using Express Router pattern
// Ceiling: RESTful routing only, no GraphQL or tRPC
app.use("/api/entrypage", entryRoutes);
app.use("/api/plan-routes", planRouteRoutes);
app.use("/api/stations", nearbyStationRoutes);
app.use("/api/filter-preferences", filterPreferencesRoutes);
app.use("/api", stationRoutes); // Additional station routes (regions, suburbs, nearest)

// ponytail: Global error handling middleware (Rung 1: Express error middleware)
// Why: Centralized error handling, consistent error responses
// Ceiling: Simple error logging, no error tracking service integration
// Upgrade: Add Sentry or similar for production error monitoring
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// this basically starts the Express server after connecting to MongoDB
async function startServer() {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
