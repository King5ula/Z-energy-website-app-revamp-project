import { connectDB } from '../db/connect.js';
import Station from '../models/nearbyStationModel.js';

const updateLiveMarketPrices = async () => {
    try {
        await connectDB();
        console.log('Database connected. Ready for live price feeds');

        const stations = await Station.find({});

        for (let station of stations) {

            const random91Price = Number((2.25 + Math.random() * 0.25).toFixed(2));
            const random95Price = Number((2.95 + Math.random() * 0.20).toFixed(2));
            const randomDieselPrice = Number((1.95 + Math.random() * 0.15).toFixed(2))

            await Station.findByIdAndUpdate(station._id, {
<<<<<<< HEAD
                priceZ91Unleaded: random91Price,
                priceZxPremium: random95Price,
=======
                priceUnleadedZ91: random91Price,
                pricePremiumZxPremium: random95Price,
>>>>>>> 6d0935644d87c39d29bb52a705aa3594ead6e349
                priceZDiesel: station.hasZDiesel ? randomDieselPrice : 0.00
            });
        }

        console.log(`Recalculated fuel pricing across ${stations.length} branches, successfully`);
        process.exit(0);
    } catch (error) {
        console.log('Price adjustment error:', error.message);
        process.exit(1)
    }
};
<<<<<<< HEAD

updateLiveMarketPrices();
=======
>>>>>>> 6d0935644d87c39d29bb52a705aa3594ead6e349
