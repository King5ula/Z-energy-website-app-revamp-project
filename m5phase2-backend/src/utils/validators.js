// ponytail: Pure validation logic for coordinates (Rung 5: No dependencies)
// Why: Simple validation needs, no complex schema - avoid library overhead
// Ceiling: Manual validation, no reusable schema validation
// Upgrade: Use Zod or Joi if validation rules become complex or need reuse

// this basically validates lat/lng coordinates and returns parsed numbers
export const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates: lat and lng must be numbers');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }

  return { latitude, longitude };
};
