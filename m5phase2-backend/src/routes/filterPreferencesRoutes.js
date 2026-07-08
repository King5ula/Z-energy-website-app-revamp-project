// Route Mapping
import { Router } from "express";
import { handleGetFilteredStations } from "../controllers/filterPreferencesController.js";

const router = Router();
router.get("/", handleGetFilteredStations);

export default router;
