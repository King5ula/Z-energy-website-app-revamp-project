// ponytail: Data transformation for frontend compatibility (Rung 5: Pure logic)
// Why: Decouple DB schema from frontend API contract - frontend expects nested address
// Ceiling: Manual mapping, no schema validation on output
// Upgrade: Use transformation library like io-ts or Zod if mappings get complex

// this basically formats station data to match frontend's expected structure
export const formatStationForFrontend = (station) => {
  if (!station) return null;

  // Transform flat address/city structure to nested address object expected by frontend
  return {
    ...station,
    address: {
      line1: station.address || 'Address Not Listed',
      suburb: '', // We don't have suburb data separately
      region: station.city || 'New Zealand',
      postcode: '' // We don't have postcode data
    },
    // Keep the original address and city for backward compatibility
    originalAddress: station.address,
    originalCity: station.city
  };
};

// this basically formats an array of stations for the frontend
export const formatStationsForFrontend = (stations) => {
  if (!Array.isArray(stations)) return [];
  return stations.map(formatStationForFrontend);
};
