import { config } from "./src/config/env.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/db/connect.js";

import entryRoutes from "./src/routes/entryRoutes.js";
import planRouteRoutes from "./src/routes/planRouteRoutes.js";
import nearbyStationRoutes from "./src/routes/nearbyStationRoutes.js";
import filterPreferencesRoutes from "./src/routes/filterPreferencesRoutes.js";

const app = express();

app.use(
  cors({
    origin: config.frontendOrigin,
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "m5phase2-backend",
    mongo: "connected",
  });
});

app.use("/api/entrypage", entryRoutes);
app.use("/api/plan-routes", planRouteRoutes);
app.use("/api/nearby-stations", nearbyStationRoutes);
app.use("/api/filter-preferences", filterPreferencesRoutes);

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
