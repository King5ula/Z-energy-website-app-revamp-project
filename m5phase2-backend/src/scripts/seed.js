import fs from 'fs';
import mongoose from 'mongoose';
import { connectDB } from '../db/connect.js';
import Station from '../models/nearbyStationModel.js';

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('MongoDB connection for seeding...');

        const rawData = fs.readFileSync('stations.geojson', 'utf-8');
        const geojsonData = JSON.parse(rawData);

        await Station.deleteMany({});
        console.log('Old Station data cleared');


        const stationsToInsert = geojsonData.features.map((feature, index) => {
        const props = feature.properties;

        const computedAddress = props[ 'addr:street']
        ?`${props['addr:housenumber'] || ''} ${props['addr:street']}`.trim()
        : `${props.branch || 'Main'} Road`;

        const baseIsTruck = props.truck === 'yes' || props.branch?.toLowerCase().includes('truckstop');
        const baseHasDiesel = props['fuel:diesel'] === 'yes' || baseIsTruck;

        return{
            name: props.name || 'Z Energy',
            officialName: props.official_name || props.branch || 'Z station',
            address: props['addr:street'] || props.branch || 'Main Road',
            city: props['addr:city']|| 'New Zealand',
            phone: props.phone ||'No Phone Listed',
            openingHours: props.opening_hours || 'Hours Not Listed',
            website: props.website || 'heeps://www.z.co.nz',

            //STATION TYPES
            isTruckStop: baseIsTruck,
            isServiceStation: !baseIsTruck,
            isEvChargingStation: index % 5 === 0,

            //SERVICES SEEDING MAP
            hasEvCharging: index % 5 === 0,
            hasEvChargingComingSoon: index % 5 === 1,
            hasFreal: index % 3 === 0,             // Placed across standard retail nodes
            hasPreOrderCoffee: index % 2 === 0,    // Shared amenity assignment
            hasPayInApp: true,                     // Standard software core functionality
            hasZEspressCoffeeFood: index % 2 === 0,
            hasZ2oCarwash: index % 4 === 0,        // Every 4th station has a car wash unit
            hasTrailerHire: index % 7 === 0,
            hasLpgSwapNGo: index % 3 !== 0,
            has247PayAtPump: props.opening_hours === '24/7' || index % 2 === 0,
            hasSuperlongHoses: index % 3 === 1,
            hasBathrooms: index % 2 === 0 || !baseIsTruck,
            hasPayByPlate: index % 3 === 0,
            hasCompostableCups: index % 2 === 0,
            hasAdBlueDieselFluid: baseHasDiesel,
            hasFastFillDiesel: baseIsTruck || (baseHasDiesel && index % 2 === 0),
            hasAtm: index % 4 === 1,
            hasClubPlus: true,                      // Available corporate loyalty system anchor

            //FUEL TYPES
            hasZxPremium: index % 8 !== 0,
            hasZ91Unleaded: true,
            hasDiesel: props['fuel: diesel'] === 'yes',
            location: {
                type: 'Point',
                coordinates: feature.geometry.coordinates
            }
        };
        });

        await Station.insertMany(stationsToInsert)
        console.log(`Injecting ${stationsToInsert.length} stations, Successfully`);

        mongoose.connection.close();
        process.exit(0)
    } catch (error) {
        console.log('Unable to seed data', error.message);
        process.exit(1);
    }
};

seedDatabase();