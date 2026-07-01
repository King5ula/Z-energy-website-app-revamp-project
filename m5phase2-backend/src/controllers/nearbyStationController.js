import Station from '../models/nearbyStationModel.js';

export const getAllStations = async (req, res) => {
    try {
        const searchWord = req.query.search;

        let searchRules = {};

        if(req.query.lng && req.query.lat) {
            searchRules.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(req.query.lng), Number(req.query.lat)]
                    },
                    $maxDistance: 20000
                }
            };
        }

        const stations = await Station.find(searchRules);

        res.status(200).json(stations);
    } catch (error) {
        res.status(500).json({ message: 'Server error'});
    }
};