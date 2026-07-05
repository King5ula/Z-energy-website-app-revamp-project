import Station from '../models/nearbyStationModel.js';

export const getAllStations = async (req, res) => {
    try {
        const searchWord = req.query.search;

        let searchRules = {};

        if(searchWord && searchWord.trim().length > 0) {
           const cleanSearch =searchWord.trim();

           searchRules.$or = [
            {name: { $regex: cleanSearch, $options: 'i'} },
            {officialName: { $regex: cleanSearch, $options: 'i'} },
            {website: { $regex: cleanSearch, $options: 'i'} }
           ];
        }
         if (req.query.lng && req.query.lat) {
      const parsedLng = Number(req.query.lng);
      const parsedLat = Number(req.query.lat);

        if (parsedLng >= -180 && parsedLng <= 180 && parsedLat >= -90 && parsedLat <= 90) {
        searchRules.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat]
                    },
                    $maxDistance: 15000
                }
            };
        }
    }

    //Query MongoDB
    const stations = await Station.find(searchRules)
    return res.status(200).json(stations);

} catch (error) {
    console.error('Backend DB Error:', error.message);
    return res.status(200).json([]);
    }
}