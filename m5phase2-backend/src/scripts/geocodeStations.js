import mongoose from 'mongoose';
import Station from '../models/nearbyStationModel.js';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Function to geocode an address using Google Geocoding API
async function geocodeAddress(address, city) {
  const fullAddress = `${address}, ${city}, New Zealand`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}&region=nz`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const formattedAddress = data.results[0].formatted_address;

      return {
        success: true,
        coordinates: [location.lng, location.lat], // GeoJSON format: [longitude, latitude]
        formattedAddress: formattedAddress
      };
    } else {
      return {
        success: false,
        error: `Geocoding failed: ${data.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main function to geocode all stations
async function geocodeAllStations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all stations
    const stations = await Station.find({});
    console.log(`Found ${stations.length} stations to geocode`);

    let successCount = 0;
    let failCount = 0;

    for (const station of stations) {
      console.log(`\nProcessing: ${station.name} - ${station.address}, ${station.city}`);

      // Skip if already has valid coordinates
      if (station.location &&
          station.location.coordinates &&
          station.location.coordinates[0] !== 0 &&
          station.location.coordinates[1] !== 0) {
        console.log(`  ✓ Already has valid coordinates`);
        successCount++;
        continue;
      }

      // Try to geocode
      const result = await geocodeAddress(station.address, station.city);

      if (result.success) {
        // Update the station with geocoded data
        station.location = {
          type: 'Point',
          coordinates: result.coordinates
        };

        await station.save();
        console.log(`  ✓ Geocoded successfully: ${result.coordinates}`);
        console.log(`    Formatted address: ${result.formattedAddress}`);
        successCount++;
      } else {
        console.log(`  ✗ Failed: ${result.error}`);
        failCount++;
      }

      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n=== Geocoding Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Total: ${stations.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
geocodeAllStations();
