import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Station from '../models/nearbyStationModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_DIRECTIONS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY;

// Function to reverse geocode coordinates to get address
async function reverseGeocode(lat, lng) {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&region=nz`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components;

      // Extract address components
      const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || '';
      const route = components.find(c => c.types.includes('route'))?.long_name || '';
      const locality = components.find(c => c.types.includes('locality'))?.long_name || '';
      const city = components.find(c => c.types.includes('administrative_area_level_2'))?.long_name || locality;

      const address = [streetNumber, route].filter(Boolean).join(' ') || result.formatted_address.split(',')[0];

      return {
        address,
        city: city || 'New Zealand',
        formattedAddress: result.formatted_address
      };
    }
  } catch (error) {
    console.error(`Geocoding error for ${lat},${lng}:`, error.message);
  }

  return null;
}


// Function to extract station name from properties
function getStationName(properties) {
  if (properties.name && properties.name !== 'Z') {
    return properties.name;
  }
  if (properties.branch) {
    return `Z ${properties.branch}`;
  }
  if (properties.official_name) {
    return properties.official_name;
  }
  return 'Z Energy Station';
}

// Function to extract address
function getAddress(properties) {
  const parts = [];

  if (properties['addr:housenumber']) {
    parts.push(properties['addr:housenumber']);
  }
  if (properties['addr:street']) {
    parts.push(properties['addr:street']);
  }

  if (parts.length > 0) {
    return parts.join(' ');
  }

  // Fallback
  if (properties.branch) {
    return properties.branch;
  }

  return 'Address Not Listed';
}

// Function to get city/suburb
function getCity(properties) {
  if (properties['addr:city']) {
    return properties['addr:city'];
  }
  if (properties['addr:suburb']) {
    return properties['addr:suburb'];
  }
  return 'New Zealand';
}

// Main import function
async function importStations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read GeoJSON file
    const geojsonPath = path.join(__dirname, '..', '..', 'stations.geojson');
    console.log(`Reading GeoJSON from: ${geojsonPath}`);

    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    console.log(`Found ${geojsonData.features.length} stations in GeoJSON`);

    // Clear existing stations
    const deleteResult = await Station.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing stations`);

    // Transform and import stations
    const stations = [];
    let geocodedCount = 0;

    for (let i = 0; i < geojsonData.features.length; i++) {
      const feature = geojsonData.features[i];
      const props = feature.properties;
      const coords = feature.geometry.coordinates; // [lng, lat]

      let address = getAddress(props);
      let city = getCity(props);

      // If address is generic, use reverse geocoding
      if (address === 'Address Not Listed' || city === 'New Zealand') {
        console.log(`Geocoding station ${i + 1}/${geojsonData.features.length}: ${getStationName(props)}`);

        const geocoded = await reverseGeocode(coords[1], coords[0]); // lat, lng

        if (geocoded) {
          if (address === 'Address Not Listed') {
            address = geocoded.address;
          }
          if (city === 'New Zealand') {
            city = geocoded.city;
          }
          geocodedCount++;
        }

        // Rate limiting - wait 50ms between requests
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const station = {
        name: getStationName(props),
        officialName: props.official_name || props.name || 'Z Energy',
        address: address,
        city: city,
        phone: props.phone || 'No Phone Listed',
        openingHours: props.opening_hours || 'Hours Not Listed',
        website: props.website || '',

        // Station type
        isTruckStop: false,
        isServiceStation: true,
        isEvChargingStation: props['charging_station'] === 'yes' || false,

        // Services - parse from properties
        hasEvCharging: props['fuel:electric'] === 'yes' || props['charging_station'] === 'yes' || false,
        hasEvChargingComingSoon: false,
        hasFreal: false,
        hasPreOrderCoffee: false,
        hasPayInApp: false,
        hasZEspressCoffeeFood: props.shop === 'coffee' || false,
        hasZ2oCarwash: props.car_wash === 'yes' || false,
        hasTrailerHire: false,
        hasLpgSwapNGo: props['fuel:lpg'] === 'yes' || false,
        has247PayAtPump: props.opening_hours === '24/7',
        hasSuperlongHoses: false,
        hasBathrooms: props.toilets === 'yes' || false,
        hasPayByPlate: false,
        hasCompostableCups: false,
        hasAdBlueDiesel: props['fuel:adblue'] === 'yes' || false,
        hasFastFillDiesel: false,
        hasAtm: props.atm === 'yes' || false,
        hasClubPlus: false,

        // Fuel types
        hasZxPremium: props['fuel:octane_95'] === 'yes' || props['fuel:octane_98'] === 'yes' || true,
        hasZ91Unleaded: props['fuel:octane_91'] === 'yes' || true,
        hasZDiesel: props['fuel:diesel'] === 'yes' || true,

        // Location in GeoJSON format
        location: {
          type: 'Point',
          coordinates: coords // [longitude, latitude]
        }
      };

      stations.push(station);
    }

    // Insert stations
    const result = await Station.insertMany(stations);
    console.log(`\n✓ Successfully imported ${result.length} stations`);
    console.log(`✓ Geocoded ${geocodedCount} stations with missing address data`);

    // Show sample of imported data
    console.log('\nSample station:');
    console.log(JSON.stringify(stations[0], null, 2));

    // Verify geospatial index
    const indexes = await Station.collection.getIndexes();
    console.log('\nIndexes:');
    console.log(indexes);

  } catch (error) {
    console.error('Error importing stations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the import
importStations();
