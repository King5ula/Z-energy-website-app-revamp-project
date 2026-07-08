import { getFilteredStations } from "../services/filterPreferencesService.js";
import { formatStationsForFrontend } from "../utils/stationFormatter.js";
import { sendSuccess, sendError } from "../utils/responseHandlers.js";

export async function handleGetFilteredStations(req, res) {
  try {
    const filters = req.query.filters ? req.query.filters.split(",") : [];
    const stations = await getFilteredStations(filters);
    sendSuccess(
      res,
      formatStationsForFrontend(stations),
      "Filtered stations retrieved successfully",
    );
  } catch (error) {
    sendError(res, error);
  }
}
