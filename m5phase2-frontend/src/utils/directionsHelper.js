export function buildDirectionsUrl(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving'
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
