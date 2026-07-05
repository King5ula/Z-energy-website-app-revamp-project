// Route Mapping
import { Router } from "express";
import { getAllStations } from "../controllers/nearbyStationController.js";

const router = Router();

router.get('/', getAllStations);
 

export default router;