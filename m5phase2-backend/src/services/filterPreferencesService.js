import Station from "../models/nearbyStationModel.js";

function buildFilterQuery(filters) {
  if (!filters || filters.length === 0) {
    return {};
  }
  const orConditions = [];

  if (filters.includes("payAtPump")) {
    orConditions.push({ has247PayAtPump: true });
  }
  if (filters.includes("evCharging")) {
    orConditions.push({ hasEvCharging: true });
  }
  if (filters.includes("truckStop")) {
    orConditions.push({ isTruckStop: true });
  }
  if (filters.includes("carWash")) {
    orConditions.push({ hasZ2oCarwash: true });
  }
  if (filters.includes("diesel")) {
    orConditions.push({ hasZDiesel: true });
  }
  return { $or: orConditions };
}

export async function getFilteredStations(filters) {
  const query = buildFilterQuery(filters);
  return await Station.find(query).lean(); // Use lean() to return plain JavaScript objects instead of Mongoose documents
}
